import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { agentsAPI, messagesAPI } from '../../lib/firebaseAPI';
import { auth } from '../../lib/firebase';
import { SpinnerLoader } from '../../components/Preloader';
import DefaultAvatar from '../../components/DefaultAvatar';
import { 
  Search, 
  Filter, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Users, 
  Building2, 
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  CheckCircle,
  TrendingUp,
  Shield,
  Loader2
} from 'lucide-react';

const Agents = () => {
  const { isDark } = useTheme();
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAgent, setModalAgent] = useState(null);
  const [contactingAgent, setContactingAgent] = useState(null);

  // Fetch agents from Firebase
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await agentsAPI.getVerified();
        const verifiedAgents = response.agents || [];
        
        // Map agents with proper data structure
        const processedAgents = verifiedAgents.map(agent => ({
          ...agent,
          status: 'Available',
          experience: agent.experience || agent.yearsOfExperience || 'New',
          propertiesCount: agent.propertiesCount || agent.propertiesSold || 0,
          rating: agent.rating || null,
          reviewCount: agent.reviewCount || null,
          location: agent.location || agent.city || agent.state || 'Kenya',
          specialization: agent.specialization || agent.specialty || 'General',
          bio: agent.bio || agent.description || 'Professional real estate agent with extensive experience in the market.'
        }));
        
        console.log('Fetched verified agents:', processedAgents);
        setAgents(processedAgents);
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load agents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const locations = useMemo(() => {
    const set = new Set();
    agents.forEach(a => {
      const loc = a.location || (a.city && a.state ? `${a.city}, ${a.state}` : a.city || a.state || 'Kenya');
      if (loc) set.add(loc);
    });
    return ['All Locations', ...Array.from(set)];
  }, [agents]);

  const specialties = useMemo(() => {
    const set = new Set();
    agents.forEach(a => { if (a.specialization) set.add(a.specialization); });
    return ['All Specialties', ...Array.from(set)];
  }, [agents]);

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const agentLoc = agent.location || (agent.city && agent.state ? `${agent.city}, ${agent.state}` : agent.city || agent.state || 'Kenya');
      const matchesLocation = selectedLocation === '' || selectedLocation === 'All Locations' || (agentLoc || '').includes(selectedLocation);
      const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All Specialties' || agent.specialization?.includes(selectedSpecialty);
      
      return matchesSearch && matchesLocation && matchesSpecialty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return parseInt(b.experience || '0') - parseInt(a.experience || '0');
        case 'propertiesSold':
          return (b.propertiesSold || 0) - (a.propertiesSold || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  const handleContactAgent = async (agent) => {
    console.log('handleContactAgent called with agent:', agent);
    console.log('currentUser:', currentUser);
    console.log('currentUser?.uid:', currentUser?.uid);
    console.log('authLoading:', authLoading);
    
    // Wait for auth to load if it's still loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      // Wait a bit for auth to finish loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (authLoading) {
        console.log('Auth still loading after delay, aborting');
        return;
      }
    }
    
    // Try to get the current user from Firebase Auth directly
    let user = currentUser;
    if (!user || !user.uid) {
      console.log('currentUser is null, trying to get from Firebase Auth directly...');
      user = auth.currentUser;
      console.log('Firebase auth.currentUser:', user);
    }
    
    if (!user || !user.uid) {
      console.log('User not authenticated, redirecting to login');
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setContactingAgent(agent.id);

    try {
      console.log('Agent data:', agent);
      console.log('User UID:', user.uid);
      
      // Check if conversation already exists
      const existingConversations = await messagesAPI.getConversations(user.uid);
      console.log('Existing conversations:', existingConversations);
      let conversationId = null;

      // Look for existing conversation with this agent
      for (const conv of existingConversations.conversations) {
        console.log('Checking conversation:', conv);
        // Check if the agent's UID is in the participants
        if (conv.participants && (conv.participants.includes(agent.id) || conv.participants.includes(agent.uid))) {
          conversationId = conv.id;
          console.log('Found existing conversation:', conversationId);
          break;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        // Use agent.uid if available, otherwise use agent.id
        const agentParticipantId = agent.uid || agent.id;
        console.log('Creating conversation with participants:', { currentUserUid: user.uid, agentId: agentParticipantId });
        try {
          conversationId = await messagesAPI.createConversation([user.uid, agentParticipantId]);
          console.log('Created conversation with ID:', conversationId);
        } catch (createError) {
          console.error('Error creating conversation:', createError);
          throw createError;
        }
      }

      // Send initial message
      const initialMessage = {
        senderId: user.uid,
        text: `Hi ${agent.name}! I'm interested in learning more about your real estate services. Could you please provide more information about your expertise and available properties?`,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      console.log('Sending initial message:', initialMessage);
      await messagesAPI.sendMessage(conversationId, initialMessage);
      console.log('Message sent successfully');

      // Navigate to messages page
      navigate('/messages');

    } catch (error) {
      console.error('Error contacting agent:', error);
      // You could add a toast notification here
    } finally {
      setContactingAgent(null);
    }
  };

  const AgentCard = ({ agent }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
      <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {agent.image ? (
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#51faaa]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <DefaultAvatar 
                name={agent.name} 
                size="lg" 
                showVerification={true}
                className={agent.image ? 'hidden' : ''}
              />
            </div>
            <div>
              <h3 className={`text-lg font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{agent.name}</h3>
              <p className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{agent.specialization}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className={`text-sm font-outfit font-semibold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                    {agent.rating ? agent.rating.toFixed(1) : 'New'}
                  </span>
                </div>
                {agent.reviewCount && (
                  <span className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
                    ({agent.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : isDark 
                  ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:text-red-500 hover:bg-red-500/10' 
                  : 'bg-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-blue-50'}`}>
            <div className={`text-lg font-outfit font-bold ${isDark ? 'text-[#51faaa]' : 'text-blue-700'}`}>
              {agent.experience ? `${agent.experience} years` : 'New'}
            </div>
            <div className={`text-xs font-outfit ${isDark ? 'text-[#ccc]' : 'text-blue-600'}`}>Experience</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-green-50'}`}>
            <div className={`text-lg font-outfit font-bold ${isDark ? 'text-[#51faaa]' : 'text-green-700'}`}>
              {agent.propertiesSold || agent.propertiesCount || 0}
            </div>
            <div className={`text-xs font-outfit ${isDark ? 'text-[#ccc]' : 'text-green-600'}`}>Properties</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${isDark ? 'bg-[rgba(81,250,170,0.1)]' : 'bg-purple-50'}`}>
            <div className={`text-lg font-outfit font-bold ${isDark ? 'text-[#51faaa]' : 'text-purple-700'}`}>
              {agent.status || 'Available'}
            </div>
            <div className={`text-xs font-outfit ${isDark ? 'text-[#ccc]' : 'text-purple-600'}`}>Status</div>
          </div>
        </div>

        {/* Location & Specialties */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#51faaa]" />
            <span className={`text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
              {agent.location || agent.city || agent.state || 'Kenya'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.specialization && (
              <span
                className={`px-2 py-1 text-xs font-outfit rounded-full ${
                  isDark 
                    ? 'bg-[rgba(81,250,170,0.2)] text-[#51faaa]' 
                    : 'bg-[#51faaa]/10 text-[#51faaa]'
                }`}
              >
                {agent.specialization}
              </span>
            )}
            {agent.specialties && agent.specialties.map((specialty, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-outfit rounded-full ${
                  isDark 
                    ? 'bg-[rgba(81,250,170,0.2)] text-[#51faaa]' 
                    : 'bg-[#51faaa]/10 text-[#51faaa]'
                }`}
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
          {agent.bio || agent.description || 'Professional real estate agent with extensive experience in the market.'}
        </p>

        {/* Contact Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => handleContactAgent(agent)}
            disabled={contactingAgent === agent.id || authLoading}
            className="flex-1 bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] py-2 px-4 rounded-xl font-outfit font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#51faaa]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : contactingAgent === agent.id ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Contacting...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Contact
              </>
            )}
          </button>
          <button className={`p-2 rounded-xl transition-all duration-200 ${
            isDark 
              ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:bg-[rgba(81,250,170,0.2)]' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`} onClick={() => setModalAgent(agent)}>
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen pt-32 pb-8 overflow-y-auto ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
            Our Expert Agents
          </h1>
          <p className={`font-outfit text-lg ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
            Connect with verified real estate professionals across Kenya
          </p>
        </div>

        {/* Filters and Search */}
        <div className={`${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200 shadow-lg'} rounded-2xl p-6 border mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                  isDark 
                    ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff] placeholder-[#ccc]/50' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                isDark 
                  ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                isDark 
                  ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${
                isDark 
                  ? 'border-[rgba(81,250,170,0.2)] bg-[#0a0c19] text-[#feffff]' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="rating">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="propertiesSold">Sort by Properties Sold</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className={`font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
            Showing {filteredAgents.length} of {agents.length} agents
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#51faaa] text-[#111]' 
                  : isDark 
                    ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:bg-[rgba(81,250,170,0.2)]' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#51faaa] text-[#111]' 
                  : isDark 
                    ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:bg-[rgba(81,250,170,0.2)]' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="w-4 h-4 space-y-0.5">
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
                <div className="w-full h-1 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {loading ? (
            <div className="col-span-full text-center py-12">
              <SpinnerLoader size="large" text="Loading agents..." />
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 text-red-500">
              {error}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-[#ccc]' : 'text-gray-500'}`}>
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-outfit font-semibold mb-2">No agents found</h3>
              <p className="font-outfit">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))
          )}
        </div>
      </div>

      {/* Agent Details Modal */}
      {modalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalAgent(null)}></div>
          <div className={`relative z-10 w-full max-w-2xl mx-4 rounded-2xl ${isDark ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)]' : 'bg-white border-gray-200'} border shadow-xl`}> 
                         <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 {modalAgent.image ? (
                   <img src={modalAgent.image} alt={modalAgent.name} className="w-12 h-12 rounded-full object-cover" />
                 ) : (
                   <DefaultAvatar name={modalAgent.name} size="md" showVerification={true} />
                 )}
                 <div>
                   <h3 className={`text-xl font-outfit font-bold ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>{modalAgent.name}</h3>
                   <p className={`text-sm ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{modalAgent.specialization}</p>
                 </div>
               </div>
              <button className={`px-3 py-1 rounded-lg ${isDark ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:bg-[rgba(81,250,170,0.2)]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setModalAgent(null)}>Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  <p><span className="font-semibold">Email:</span> {modalAgent.email || '—'}</p>
                  <p><span className="font-semibold">Phone:</span> {modalAgent.phone || modalAgent.phoneNumber || '—'}</p>
                  <p><span className="font-semibold">Location:</span> {modalAgent.location || [modalAgent.city, modalAgent.state].filter(Boolean).join(', ') || 'Kenya'}</p>
                </div>
                <div className={`${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
                  <p><span className="font-semibold">Experience:</span> {modalAgent.experience || '—'}</p>
                  <p><span className="font-semibold">Properties Sold:</span> {modalAgent.propertiesSold ?? '—'}</p>
                  <p><span className="font-semibold">Rating:</span> {modalAgent.rating ?? '—'}</p>
                </div>
              </div>
              <div>
                <h4 className={`font-outfit font-semibold mb-1 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>About</h4>
                <p className={`${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>{modalAgent.bio || '—'}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              <a href={`mailto:${modalAgent.email || ''}`} className="bg-gradient-to-r from-[#51faaa] to-[#dbd5a4] text-[#111] py-2 px-4 rounded-xl font-outfit font-semibold">Email Agent</a>
              <button onClick={() => setModalAgent(null)} className={`${isDark ? 'bg-[rgba(81,250,170,0.1)] text-[#ccc] hover:bg-[rgba(81,250,170,0.2)]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} py-2 px-4 rounded-xl`}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
