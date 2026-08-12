import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const EnvironmentValidator = ({ onValidationComplete }) => {
  const [validationResults, setValidationResults] = React.useState(null);
  const [isValidating, setIsValidating] = React.useState(true);

  React.useEffect(() => {
    validateEnvironment();
  }, []);

  // All good - show success briefly then hide
  // Moved to top to satisfy Rules of Hooks (cannot be after early returns)
  React.useEffect(() => {
    if (isValidating || !validationResults?.isValid) return;

    const timer = setTimeout(() => {
      if (onValidationComplete) {
        onValidationComplete(validationResults);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isValidating, validationResults, onValidationComplete]);

  const validateEnvironment = () => {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      missingVars: []
    };

    // Required environment variables (critical for app functionality)
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_GOOGLE_MAPS_API_KEY'
    ];

    // Optional environment variables (warn if missing but don't fail)
    const optionalVars = [
      'VITE_GEMINI_API_KEY',          // AI features disabled if missing
      'VITE_FIREBASE_MEASUREMENT_ID', // Analytics disabled if missing
    ];

    // Check each required variable
    requiredVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value || value.trim() === '') {
        results.missingVars.push(varName);
        results.isValid = false;
        results.errors.push(`Missing required environment variable: ${varName}`);
      }
    });

    // Check optional variables (warn but don't fail)
    optionalVars.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value || value.trim() === '') {
        results.warnings.push(`Optional environment variable missing: ${varName} (some features may be disabled)`);
      }
    });

    // Check Google Maps API key format
    const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (mapsKey && !mapsKey.startsWith('AIza')) {
      results.warnings.push('Google Maps API key format may be incorrect');
    }

    // Check Firebase configuration
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      results.errors.push('Firebase configuration is incomplete');
      results.isValid = false;
    }

    // Check if we're in production
    const isProduction = import.meta.env.PROD;
    if (isProduction && !results.isValid) {
      results.errors.push('Production environment is missing critical configuration');
    }

    setValidationResults(results);
    setIsValidating(false);
  };

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Validating environment configuration...
          </p>
        </div>
      </div>
    );
  }

  if (!validationResults.isValid) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center mb-4">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Environment Configuration Error
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Critical Errors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {validationResults.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>

            {validationResults.missingVars.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Missing Environment Variables:</h3>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {validationResults.missingVars.join(', ')}
                  </code>
                </div>
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Warnings:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {validationResults.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded p-4">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">How to Fix:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                <li>Set all required environment variables in your deployment platform</li>
                <li>For Firebase Hosting: Use Firebase CLI or Firebase Console</li>
                <li>For Vercel: Go to Project Settings → Environment Variables</li>
                <li>For Netlify: Go to Site Settings → Environment Variables</li>
                <li>Rebuild and redeploy your application</li>
              </ol>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Allow user to continue anyway (not recommended)
                  if (onValidationComplete) {
                    onValidationComplete({ ...validationResults, forceContinue: true });
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed top-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 z-50">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        <span className="text-green-800 dark:text-green-200 text-sm font-medium">
          Environment configuration valid
        </span>
      </div>
    </div>
  );
};

export default EnvironmentValidator;
