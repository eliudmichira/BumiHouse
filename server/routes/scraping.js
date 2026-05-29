import express from 'express';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const prisma = new PrismaClient();

// Store active scraping processes
const activeProcesses = new Map();

// Get scraping status and statistics
router.get('/status', async (req, res) => {
  try {
    const stats = await prisma.externalListing.groupBy({
      by: ['source'],
      _count: {
        id: true
      },
      _max: {
        createdAt: true
      }
    });

    const totalListings = await prisma.externalListing.count();
    const importedListings = await prisma.externalListing.count({
      where: { imported: true }
    });

    const activeScrapers = Array.from(activeProcesses.keys());

    res.json({
      totalListings,
      importedListings,
      pendingListings: totalListings - importedListings,
      stats: stats.map(stat => ({
        source: stat.source,
        count: stat._count.id,
        lastScraped: stat._max.createdAt
      })),
      activeScrapers,
      isScraping: activeProcesses.size > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent scraped listings
router.get('/listings', async (req, res) => {
  try {
    const { page = 1, limit = 20, source, imported } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (source) where.source = source;
    if (imported !== undefined) where.imported = imported === 'true';

    const listings = await prisma.externalListing.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.externalListing.count({ where });

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start scraping process
router.post('/start', async (req, res) => {
  try {
    const { pages = 2, sites = ['jiji', 'property24', 'buyrentkenya'] } = req.body;

    if (activeProcesses.size > 0) {
      return res.status(400).json({ error: 'Scraping already in progress' });
    }

    const processId = Date.now().toString();
    const scriptPath = path.join(__dirname, '../scripts/crawl.js');
    
    const env = {
      ...process.env,
      SCRAPE_PAGES: pages.toString(),
      DRY_RUN: '0'
    };

    const childProcess = spawn('node', [scriptPath], {
      env,
      cwd: path.dirname(__dirname)
    });

    let logs = [];
    let isComplete = false;

    childProcess.stdout.on('data', (data) => {
      const log = data.toString().trim();
      logs.push({ timestamp: new Date(), message: log, type: 'info' });
    });

    childProcess.stderr.on('data', (data) => {
      const log = data.toString().trim();
      logs.push({ timestamp: new Date(), message: log, type: 'error' });
    });

    childProcess.on('close', (code) => {
      isComplete = true;
      logs.push({ 
        timestamp: new Date(), 
        message: `Process completed with code ${code}`, 
        type: code === 0 ? 'success' : 'error' 
      });
      activeProcesses.delete(processId);
    });

    activeProcesses.set(processId, {
      process: childProcess,
      logs,
      isComplete,
      startTime: new Date(),
      config: { pages, sites }
    });

    res.json({ 
      processId, 
      message: 'Scraping started',
      config: { pages, sites }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop scraping process
router.post('/stop', async (req, res) => {
  try {
    const { processId } = req.body;
    
    if (processId && activeProcesses.has(processId)) {
      const processData = activeProcesses.get(processId);
      processData.process.kill();
      activeProcesses.delete(processId);
      res.json({ message: 'Scraping stopped' });
    } else {
      // Stop all processes
      for (const [id, processData] of activeProcesses) {
        processData.process.kill();
      }
      activeProcesses.clear();
      res.json({ message: 'All scraping processes stopped' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraping logs
router.get('/logs/:processId', (req, res) => {
  try {
    const { processId } = req.params;
    const processData = activeProcesses.get(processId);
    
    if (!processData) {
      return res.status(404).json({ error: 'Process not found' });
    }

    res.json({
      processId,
      logs: processData.logs,
      isComplete: processData.isComplete,
      startTime: processData.startTime,
      config: processData.config
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import scraped data to Property table
router.post('/import', async (req, res) => {
  try {
    const { batchSize = 100 } = req.body;
    
    const scriptPath = path.join(__dirname, '../scripts/normalizeAndImport.js');
    const env = {
      ...process.env,
      IMPORT_BATCH: batchSize.toString()
    };

    const childProcess = spawn('node', [scriptPath], {
      env,
      cwd: path.dirname(__dirname)
    });

    let logs = [];
    let isComplete = false;

    childProcess.stdout.on('data', (data) => {
      const log = data.toString().trim();
      logs.push({ timestamp: new Date(), message: log, type: 'info' });
    });

    childProcess.stderr.on('data', (data) => {
      const log = data.toString().trim();
      logs.push({ timestamp: new Date(), message: log, type: 'error' });
    });

    childProcess.on('close', (code) => {
      isComplete = true;
      logs.push({ 
        timestamp: new Date(), 
        message: `Import completed with code ${code}`, 
        type: code === 0 ? 'success' : 'error' 
      });
    });

    res.json({ 
      message: 'Import process started',
      batchSize 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scraping configuration
router.get('/config', (req, res) => {
  res.json({
    availableSites: [
      { id: 'jiji', name: 'Jiji.co.ke', status: 'active' },
      { id: 'property24', name: 'Property24 Kenya', status: 'active' },
      { id: 'buyrentkenya', name: 'BuyRentKenya', status: 'active' }
    ],
    defaultPages: 2,
    maxPages: 10
  });
});

export default router;
