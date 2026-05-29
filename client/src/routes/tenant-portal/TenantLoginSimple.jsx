import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Phone, Lock, Shield, ArrowRight, Sparkles, Check, Star, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '../../components/Logo';

// Lightweight toast
const showNotification = (options) => {
  const el = document.createElement('div');
  el.className = 'fixed top-6 right-6 z-[9999]';
  el.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl p-5 min-w-[300px] max-w-[400px] ${options.color === 'red'
      ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
      : options.color === 'blue'
        ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600'
        : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
    } text-white shadow-2xl backdrop-blur-xl border border-white/20">
      <div class="relative flex items-start gap-4">
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm tracking-wide mb-1">${options.title}</div>
          <div class="text-xs opacity-90 leading-relaxed">${options.message}</div>
        </div>
      </div>
    </div>
  `;
  el.style.transform = 'translateX(120%) scale(0.9)';
  el.style.opacity = '0';
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transition = 'all .4s ease';
    el.style.transform = 'translateX(0) scale(1)';
    el.style.opacity = '1';
  });
  setTimeout(() => {
    el.style.transform = 'translateX(120%) scale(0.9)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, 3000);
};

// Premium Input
const PremiumInput = ({ label, placeholder, type = 'text', icon: Icon, value, onChange, error, showPassword, onTogglePassword, disabled = false, isFocused }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 tracking-wide">{label}</label>
      <div className="relative group">
        <div className={`relative flex items-center border-2 rounded-full px-6 py-4 transition-all duration-500 ease-out backdrop-blur-xl ${isFocused ? 'border-emerald-500/80 bg-white/90 shadow-xl shadow-emerald-500/20' : 'bg-white/70 border-gray-200/50 hover:border-gray-300/70 hover:bg-white/80'
          } ${error ? 'border-red-500/80 bg-red-50/50' : ''}`}>
          {Icon && <Icon className={`w-5 h-5 mr-4 transition-colors ${isFocused ? 'text-emerald-600' : 'text-gray-500'}`} />}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`flex-1 bg-transparent outline-none text-base font-medium tracking-wide text-gray-900 placeholder-gray-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {type === 'password' && (
            <button type="button" onClick={onTogglePassword} disabled={disabled} className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Premium Button
const PremiumButton = ({ children, onClick, disabled = false, loading = false, fullWidth = false, rightIcon = null }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`relative overflow-hidden rounded-2xl px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] ${fullWidth ? 'w-full' : ''
      } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
      <span className="inline-flex items-center gap-3">
        {children}
        {rightIcon}
      </span>
    )}
  </button>
);

const TenantLoginPremium = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', apartment: '', pin: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\+254\d{9}$/.test(form.phone)) newErrors.phone = 'Use +254XXXXXXXXX format';
    if (!form.apartment) newErrors.apartment = 'Property name is required';
    if (!form.pin) newErrors.pin = 'Unit number/PIN is required';
    return newErrors;
  };

  const onChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      showNotification({ color: 'red', title: 'Please check your input', message: 'Some fields need your attention' });
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    try {
      const isValidDemo = (
        form.phone === '+254701234567' && /sunset/i.test(form.apartment) && /a-101/i.test(form.pin)
      ) || (
          form.phone === '+254707654321' && /sunset/i.test(form.apartment) && /b-205/i.test(form.pin)
        ) || (
          form.phone === '+254709876543' && /green valley/i.test(form.apartment) && /main/i.test(form.pin)
        );
      if (isValidDemo) {
        const tenantData = {
          '+254701234567': { name: 'John Doe', unit: 'A-101', property: 'Sunset Apartments' },
          '+254707654321': { name: 'Jane Smith', unit: 'B-205', property: 'Sunset Apartments' },
          '+254709876543': { name: 'Mike Johnson', unit: 'Main', property: 'Green Valley Residence' }
        };
        const tenant = tenantData[form.phone];
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedTenant', JSON.stringify({ phone: form.phone, apartment: form.apartment }));
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedTenant');
        }
        sessionStorage.setItem('tenant_session', JSON.stringify({
          tenantId: `tenant_${Date.now()}`,
          phone: form.phone,
          propertyName: tenant.property,
          unitNumber: tenant.unit,
          name: tenant.name,
          monthlyRent: Math.floor(Math.random() * 20000) + 15000,
          balance: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 5000),
          status: 'active',
          loginTime: new Date().toISOString(),
        }));
        showNotification({ color: 'green', title: 'Welcome home! 🏠', message: `Signed in as ${tenant.name}` });
        setTimeout(() => navigate('/tenant-dashboard'), 900);
      } else {
        showNotification({ color: 'red', title: 'Invalid credentials', message: 'Please check your details and try again' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { name: 'John Doe', phone: '+254701234567', property: 'Sunset', unit: 'A-101', badge: 'Primary' },
    { name: 'Jane Smith', phone: '+254707654321', property: 'Sunset', unit: 'B-205', badge: 'Active' },
    { name: 'Mike Johnson', phone: '+254709876543', property: 'Green Valley', unit: 'Main', badge: 'Premium' }
  ];
  const applyDemo = (phone) => {
    const demo = demoAccounts.find(d => d.phone === phone);
    if (!demo) return;
    setForm({ phone: demo.phone, apartment: demo.property, pin: demo.unit });
    showNotification({ color: 'blue', title: 'Demo prefilled', message: `${demo.name} • ${demo.property} • ${demo.unit}` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
      {/* Subtle gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-green-100/30 to-emerald-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-8 w-48 h-48 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Logo variant="image" className="h-12 w-auto" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">BumiHouse</h1>
                <p className="text-sm text-gray-600 font-medium">Premium Tenant Portal</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-full border border-emerald-200">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Login */}
          <div className="lg:col-span-7 space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star className="w-4 h-4" />
                <span>Trusted by 10,000+ tenants</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Welcome to your
                <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">digital home 🏠</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">Experience seamless rent payments, instant confirmations, and premium tenant services</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 tracking-wide mb-2">Demo Account</label>
                    <select onChange={(e) => applyDemo(e.target.value)} defaultValue="" className="w-full px-4 py-3 rounded-full border-2 border-gray-200/60 bg-white text-gray-900">
                      <option value="" disabled>Choose demo</option>
                      {demoAccounts.map(a => (
                        <option key={a.phone} value={a.phone}>{a.name} • {a.property} • {a.unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <PremiumInput
                  label="Phone Number"
                  placeholder="+254712345678"
                  icon={Phone}
                  value={form.phone}
                  onChange={(v) => onChange('phone', v)}
                  error={errors.phone}
                  disabled={isLoading}
                  isFocused={focusedField === 'phone'}
                />
                <PremiumInput
                  label="Property/Building Name"
                  placeholder="e.g., Sunset Apartments, Green Valley"
                  value={form.apartment}
                  onChange={(v) => onChange('apartment', v)}
                  error={errors.apartment}
                  disabled={isLoading}
                  isFocused={focusedField === 'apartment'}
                />
                <PremiumInput
                  label="Unit Number (PIN)"
                  placeholder="Your unit number (e.g., A-101)"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  value={form.pin}
                  onChange={(v) => onChange('pin', v)}
                  error={errors.pin}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  isFocused={focusedField === 'pin'}
                />

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      disabled={isLoading}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-gray-700">Remember me</span>
                  </label>
                  <button type="button" className="text-sm font-semibold text-gray-700 hover:text-emerald-600" disabled={isLoading}>Need help?</button>
                </div>

                <PremiumButton onClick={handleLogin} disabled={isLoading} loading={isLoading} fullWidth rightIcon={!isLoading ? <ArrowRight className="w-5 h-5" /> : null}>
                  {isLoading ? 'Accessing your crib...' : '🔑 Access My Crib'}
                </PremiumButton>

                <div className="text-center pt-6">
                  <p className="text-sm text-gray-600 mb-4 font-medium">New tenant? Contact your property manager for access</p>
                  <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-bold tracking-wide">256-bit SSL encryption</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Demo cards removed; demo picker integrated above inputs */}
          </div>

          {/* Right: Features & Stats */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Experience</h3>
                <p className="text-gray-600">Why 10,000+ tenants choose CRIBBY</p>
              </div>
              <div className="space-y-6">
                {[
                  { icon: '⚡', title: 'Instant M-Pesa Payments', desc: 'STK push in under 3 seconds' },
                  { icon: '🔔', title: 'Smart Reminders', desc: 'WhatsApp & SMS notifications' },
                  { icon: '🛡️', title: 'Bank-Grade Security', desc: 'Your data is always protected' },
                  { icon: '🎯', title: 'Auto-Pay Discounts', desc: 'Save up to 5% with auto-payments' },
                  { icon: '📊', title: 'Payment History', desc: 'Track all transactions instantly' },
                  { icon: '🏆', title: '24/7 Premium Support', desc: 'Dedicated tenant success team' }
                ].map((f, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{f.title}</h4>
                      <p className="text-sm text-gray-600">{f.desc}</p>
                    </div>
                    <Check className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '99.9%', label: 'Uptime', color: 'from-blue-500 to-indigo-600' },
                { value: '10K+', label: 'Happy Tenants', color: 'from-emerald-500 to-green-600' },
                { value: '<3s', label: 'Payment Speed', color: 'from-purple-500 to-pink-600' },
                { value: '24/7', label: 'Support', color: 'from-orange-500 to-red-600' }
              ].map((s, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-200/50 text-center group hover:shadow-2xl transition-all duration-300">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>{s.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <div className="text-center">
                <h4 className="font-semibold text-emerald-900 mb-4">Trusted & Secure</h4>
                <div className="flex justify-center items-center gap-6 opacity-60">
                  <div className="text-sm font-bold text-emerald-700">PCI DSS</div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="text-sm font-bold text-emerald-700">SSL SECURED</div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="text-sm font-bold text-emerald-700">GDPR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenantLoginPremium;
