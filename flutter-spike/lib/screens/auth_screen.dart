import 'dart:math' as math;

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../theme.dart';
import '../widgets/brand_button.dart';
import '../widgets/brand_icons.dart';
import '../widgets/brand_orb.dart';
import '../widgets/brand_toggle.dart';

/// The mobile auth experience from the Capacitor web app
/// (client/src/mobile/pages/MobileAuth.jsx), ported to Flutter:
/// login / register / forgot-password modes, light+dark themes with a
/// tappable sun/moon in the illustration, and the same flows (email,
/// Google, anonymous guest).
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

enum _AuthMode { login, register, forgot }

class _AuthScreenState extends State<AuthScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _resetEmail = TextEditingController();
  late final AnimationController _orbController;
  late final AnimationController _sunSpin;
  _AuthMode _mode = _AuthMode.login;
  bool _busy = false;
  bool _obscure = true;
  bool _acceptedTerms = false;
  String? _error;

  DesignColors get _c => themeController.isDark ? kDesignDark : kDesignLight;
  bool get _isDark => themeController.isDark;

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
    _sunSpin = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
  }

  @override
  void dispose() {
    _orbController.dispose();
    _sunSpin.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    _resetEmail.dispose();
    super.dispose();
  }

  void _switchMode(_AuthMode mode, {bool clearFields = false}) {
    setState(() {
      _mode = mode;
      _error = null;
      if (clearFields) {
        _email.clear();
        _password.clear();
        _confirm.clear();
        _acceptedTerms = false;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_mode == _AuthMode.register) {
      if (_password.text != _confirm.text) {
        setState(() => _error = 'Passwords do not match.');
        return;
      }
      if (!_acceptedTerms) {
        setState(() => _error = 'Please accept the Terms of Service.');
        return;
      }
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final auth = FirebaseAuth.instance;
      if (_mode == _AuthMode.register) {
        final cred = await auth.createUserWithEmailAndPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
        // Same as the web: send a verification email, sign the user out and
        // switch back to sign-in so they verify first.
        await cred.user?.sendEmailVerification();
        await auth.signOut();
        if (!mounted) return;
        _switchMode(_AuthMode.login, clearFields: true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Account created! Please check your inbox and verify your '
              'email before signing in.',
            ),
          ),
        );
      } else {
        await auth.signInWithEmailAndPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
      }
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _friendly(e));
    } catch (_) {
      setState(() => _error = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgot() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await FirebaseAuth.instance
          .sendPasswordResetEmail(email: _resetEmail.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset email sent!')),
      );
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _friendly(e));
    } catch (_) {
      setState(() => _error = 'Failed to send reset email.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _google() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      // google_sign_in 7.x: singleton instance, initialize once, then
      // authenticate. On Android the client IDs come from google-services.json.
      final googleSignIn = GoogleSignIn.instance;
      await googleSignIn.initialize();
      final googleUser = await googleSignIn.authenticate();
      final credential = GoogleAuthProvider.credential(
        idToken: googleUser.authentication.idToken,
      );
      await FirebaseAuth.instance.signInWithCredential(credential);
    } on GoogleSignInException catch (e) {
      // Don't show an error when the user simply dismisses the picker.
      if (e.code != GoogleSignInExceptionCode.canceled) {
        setState(() => _error = e.description ?? 'Google sign-in failed.');
      }
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _friendly(e));
    } catch (_) {
      setState(() => _error = 'Google sign-in failed. Please try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _guest() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await FirebaseAuth.instance.signInAnonymously();
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _friendly(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _friendly(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
      case 'invalid-credential':
        return 'No account found for that email/password.';
      case 'wrong-password':
        return 'Incorrect password.';
      case 'email-already-in-use':
        return 'An account already exists for that email.';
      case 'weak-password':
        return 'Password must be at least 6 characters.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled yet. Enable it in the Firebase console.';
      default:
        return e.message ?? 'Authentication failed.';
    }
  }

  /// Same thresholds as the web (>=8 + uppercase + digit => strong, >=6 => medium).
  String _strength(String p) {
    if (p.length >= 8 &&
        RegExp(r'[A-Z]').hasMatch(p) &&
        RegExp(r'[0-9]').hasMatch(p)) {
      return 'strong';
    }
    return p.length >= 6 ? 'medium' : 'weak';
  }

  @override
  Widget build(BuildContext context) {
    final c = _c;
    final isDark = _isDark;
    final showSocial = _mode != _AuthMode.forgot;

    return Scaffold(
      body: Stack(
        children: [
          // Animated background orbs — only on register mode, exactly like
          // the web (showGradients={isSignUp && !showForgotPassword}).
          // Web positions: coral 500px at top:-15% right:-10% (opacity-20,
          // float 8s), blue 400px at bottom:-10% left:-15% (opacity-15,
          // float 10s reverse).
          if (_mode == _AuthMode.register)
            Positioned.fill(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final w = constraints.maxWidth;
                  final h = constraints.maxHeight;
                  return AnimatedBuilder(
                    animation: _orbController,
                    builder: (context, _) {
                      final t = _orbController.value;
                      // Approximate the web's `float` keyframes drift
                      // (translateY up to -30px, translateX up to ±10px).
                      final dx = 10 * math.sin(t * 2 * math.pi);
                      final dy = -10 - 10 * math.cos(t * 2 * math.pi);
                      return Stack(
                        children: [
                          Positioned(
                            right: -0.10 * w,
                            top: -0.15 * h,
                            child: Transform.translate(
                              offset: Offset(dx, dy),
                              child: BrandOrb(
                                size: 500,
                                color: const Color(0xFF2DD284),
                                peakAlpha: 0.2,
                              ),
                            ),
                          ),
                          Positioned(
                            left: -0.15 * w,
                            bottom: -0.10 * h,
                            child: Transform.translate(
                              offset: Offset(-dx, dy),
                              child: BrandOrb(
                                size: 400,
                                color: DesignColors.dark.emerald,
                                peakAlpha: 0.15,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  );
                },
              ),
            ),
          // Top-left pill button: Create Account <-> Sign In.
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: _ModeToggleButton(
                  label: _mode == _AuthMode.register
                      ? 'Sign In'
                      : 'Create Account',
                  isDark: isDark,
                  onTap: _busy
                      ? null
                      : () => _switchMode(
                            _mode == _AuthMode.register
                                ? _AuthMode.login
                                : _AuthMode.register,
                          ),
                ),
              ),
            ),
          ),
          // Main content.
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(24, 84, 24, 32),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Centered so the stretch column can't distort the box.
                      Center(
                        child: _AuthIllustration(
                          mode: _mode,
                          isDark: isDark,
                          spin: _sunSpin,
                          onToggleTheme: () => themeController.toggle(),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        _mode == _AuthMode.forgot
                            ? 'Reset Password'
                            : _mode == _AuthMode.register
                                ? 'Create your account'
                                : 'Sign in to BumiHouse',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w700,
                              fontSize: 26,
                              letterSpacing: -0.5,
                              color: c.textPrimary,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text.rich(
                        textAlign: TextAlign.center,
                        TextSpan(
                          style: TextStyle(
                            color: isDark
                                ? const Color(0x66FFFFFF) // white/40
                                : const Color(0x99000000), // black/60
                            fontSize: 14,
                          ),
                          children: _mode == _AuthMode.forgot
                              ? const [
                                  TextSpan(
                                    text:
                                        'Enter your email to receive a reset link',
                                  ),
                                ]
                              : _mode == _AuthMode.register
                                  ? [
                                      const TextSpan(text: 'Join '),
                                      TextSpan(
                                        text: 'thousands',
                                        style: TextStyle(
                                          color: c.accent,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const TextSpan(text: ' of home seekers'),
                                    ]
                                  : [
                                      const TextSpan(
                                        text: 'Welcome back! Your ',
                                      ),
                                      TextSpan(
                                        text: 'dream home',
                                        style: TextStyle(
                                          color: c.accent,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const TextSpan(text: ' is waiting'),
                                    ],
                        ),
                      ),
                      if (showSocial) ...[
                        const SizedBox(height: 22),
                        _UserTypeToggle(c: c, isRegister: _mode == _AuthMode.register),
                        const SizedBox(height: 6),
                        const _OrDivider(label: 'or continue with email'),
                      ],
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: _mode == _AuthMode.forgot
                                  ? _resetEmail
                                  : _email,
                              keyboardType: TextInputType.emailAddress,
                              autocorrect: false,
                              style: TextStyle(color: c.inputText),
                              decoration: InputDecoration(
                                labelText: _mode == _AuthMode.forgot
                                    ? 'Enter your email'
                                    : 'Email address',
                                prefixIcon: const Icon(Icons.mail_outline),
                              ),
                              validator: (v) {
                                // Same messages as the web's validateEmail().
                                if (v == null || v.isEmpty) {
                                  return 'Email is required';
                                }
                                if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                                    .hasMatch(v)) {
                                  return 'Invalid email format';
                                }
                                return null;
                              },
                            ),
                            if (_mode != _AuthMode.forgot) ...[
                              const SizedBox(height: 14),
                              TextFormField(
                                controller: _password,
                                obscureText: _obscure,
                                style: TextStyle(color: c.inputText),
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  prefixIcon: const Icon(Icons.lock_outline),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _obscure
                                          ? Icons.visibility_outlined
                                          : Icons.visibility_off_outlined,
                                    ),
                                    onPressed: () => setState(
                                        () => _obscure = !_obscure),
                                  ),
                                ),
                                validator: (v) =>
                                    (v == null || v.length < 6)
                                        ? 'At least 6 characters'
                                        : null,
                                onFieldSubmitted: (_) => _submit(),
                              ),
                              // Web shows the meter only once a password is typed
                              // ({isSignUp && password && ...}).
                              if (_mode == _AuthMode.register &&
                                  _password.text.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                _StrengthMeter(
                                    strength: _strength(_password.text)),
                              ],
                              if (_mode == _AuthMode.register) ...[
                                const SizedBox(height: 14),
                                TextFormField(
                                  controller: _confirm,
                                  obscureText: _obscure,
                                  style: TextStyle(color: c.inputText),
                                  decoration: const InputDecoration(
                                    labelText: 'Confirm Password',
                                    prefixIcon: Icon(Icons.lock_outline),
                                  ),
                                  validator: (v) =>
                                      (v == null || v.isEmpty)
                                          ? 'Confirm your password'
                                          : null,
                                  onFieldSubmitted: (_) => _submit(),
                                ),
                                const SizedBox(height: 14),
                                _TermsCheckbox(
                                  c: c,
                                  value: _acceptedTerms,
                                  onChanged: (v) => setState(
                                      () => _acceptedTerms = v ?? false),
                                ),
                              ],
                            ],
                          ],
                        ),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 14),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: c.error, fontSize: 13),
                        ),
                      ],
                      const SizedBox(height: 22),
                      if (showSocial) ...[
                        BrandButton(
                          gradient: DesignGradients.google,
                          foregroundColor: const Color(0xFF111827),
                          loading: _busy,
                          onPressed: _google,
                          // Web: 0px 10px 25px rgba(0,0,0,0.3) + insets
                          // (0 2px 0 white/90, 0 -2px 4px black/10).
                          shadows: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.3),
                              blurRadius: 25,
                              offset: const Offset(0, 10),
                            ),
                          ],
                          glossTop: 0.9,
                          glossBottom: 0.1,
                          border: Border.all(color: Colors.black12, width: 1),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              BrandChromeIcon(size: 20),
                              SizedBox(width: 12),
                              Text(
                                'Continue with Google',
                                style: TextStyle(
                                  fontFamily: 'Outfit',
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                      ],
                      BrandButton(
                        gradient: DesignGradients.cta,
                        foregroundColor: Colors.white,
                        loading: _busy,
                        onPressed: _mode == _AuthMode.forgot ? _forgot : _submit,
                        // Web: 0px 8px 20px rgba(16,185,129,0.3) in dark /
                        // 0.4 in light + inset 0 1px 0 white/40.
                        shadows: [
                          BoxShadow(
                            color: const Color(0xFF10B981)
                                .withValues(alpha: isDark ? 0.3 : 0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                        glossTop: 0.4,
                        child: Text(
                          _busy
                              ? ''
                              : _mode == _AuthMode.forgot
                                  ? 'Send Reset Link'
                                  : _mode == _AuthMode.register
                                      ? 'Create Account'
                                      : 'Sign In',
                          style: const TextStyle(
                            fontFamily: 'Outfit',
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      if (showSocial) ...[
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: _busy ? null : _guest,
                          icon: const Icon(Icons.person_outline),
                          label: const Text('Continue as guest'),
                        ),
                      ],
                      const SizedBox(height: 18),
                      if (_mode == _AuthMode.forgot)
                        TextButton(
                          onPressed:
                              _busy ? null : () => _switchMode(_AuthMode.login),
                          child: const Text('← Back to sign in'),
                        )
                      else ...[
                        if (_mode == _AuthMode.login)
                          TextButton(
                            onPressed: _busy
                                ? null
                                : () => _switchMode(_AuthMode.forgot),
                            child: const Text('Forgot your password?'),
                          ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _mode == _AuthMode.register
                                  ? 'Already have an account? '
                                  : "Don't have an account? ",
                              style: TextStyle(
                                color: c.textMuted,
                                fontSize: 14,
                              ),
                            ),
                            GestureDetector(
                              onTap: _busy
                                  ? null
                                  : () => _switchMode(
                                        _mode == _AuthMode.register
                                            ? _AuthMode.login
                                            : _AuthMode.register,
                                        clearFields: true,
                                      ),
                              child: Text(
                                _mode == _AuthMode.register
                                    ? 'Sign in'
                                    : 'Sign up',
                                style: TextStyle(
                                  color: c.accent,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// The single pill button in the top-left corner that toggles between
/// "Create Account" and "Sign In" (mirrors MobileAuth's top toggle).
class _ModeToggleButton extends StatelessWidget {
  const _ModeToggleButton({
    required this.label,
    required this.isDark,
    this.onTap,
  });

  final String label;
  final bool isDark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isDark
          ? Colors.white.withValues(alpha: 0.1)
          : Colors.black.withValues(alpha: 0.05),
      borderRadius: BorderRadius.circular(9999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(9999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(9999),
            border: Border.all(
              color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.08),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: isDark ? Colors.white : Colors.black,
            ),
          ),
        ),
      ),
    );
  }
}

/// Regular User / Agent pill toggle, matching the web's behavior:
/// active Regular User = zinc-800 (dark) / white (light);
/// active Agent = emerald-500 (#10b981) in both themes.
class _UserTypeToggle extends StatefulWidget {
  const _UserTypeToggle({required this.c, required this.isRegister});

  final DesignColors c;
  final bool isRegister;

  @override
  State<_UserTypeToggle> createState() => _UserTypeToggleState();
}

class _UserTypeToggleState extends State<_UserTypeToggle> {
  int _type = 0; // 0 = regular user, 1 = agent

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: c.toggleTrack,
            borderRadius: BorderRadius.circular(9999),
            border: Border.all(color: c.toggleBorder),
          ),
          child: Row(
            children: [
              _option(
                0,
                (color) => Icon(Icons.person_outline, size: 16, color: color),
                'Regular User',
              ),
              _option(
                1,
                (color) => BrandUserCheckIcon(size: 16, color: color),
                'Agent/Landlord',
              ),
            ],
          ),
        ),
        if (_type == 1) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: c.agentBoxBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: c.agentBoxBorder),
            ),
            child: Row(
              children: [
                Icon(Icons.business_center_outlined,
                    size: 18, color: c.accent),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    widget.isRegister
                        ? "Agent registration includes a brief verification process. "
                            "You'll be asked to provide your professional details after "
                            'creating your account.'
                        : 'Sign in to access your agent dashboard and manage your '
                            'listings.',
                    style: TextStyle(
                      color: c.agentBoxText,
                      fontSize: 12.5,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _option(int index, Widget Function(Color) iconBuilder, String label) {
    final c = widget.c;
    final active = _type == index;
    // Active Agent uses emerald-500; active Regular User uses the track
    // contrast (zinc-800 dark / white light), like the web.
    final activeColor =
        index == 1 ? const Color(0xFF10B981) : c.toggleActiveUser;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _type = index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: active ? activeColor : Colors.transparent,
            borderRadius: BorderRadius.circular(9999),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 14,
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              iconBuilder(active
                  ? c.toggleActiveUserText
                  : c.toggleInactiveText),
              const SizedBox(width: 7),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontWeight: FontWeight.w600,
                  fontSize: 13.5,
                  color: active ? c.toggleActiveUserText : c.toggleInactiveText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// "or continue with email" divider.
class _OrDivider extends StatelessWidget {
  const _OrDivider({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = themeController.isDark;
    final line = isDark ? Colors.white24 : Colors.black12;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 22),
      child: Row(
        children: [
          Expanded(child: Divider(color: line)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Text(
              label,
              style: TextStyle(
                color: isDark ? Colors.white60 : Colors.black54,
                fontSize: 13.5,
              ),
            ),
          ),
          Expanded(child: Divider(color: line)),
        ],
      ),
    );
  }
}

/// Mode-aware illustration with the tappable theme toggle (sun/moon),
/// copied from MobileAuth's AuthIllustration.
class _AuthIllustration extends StatelessWidget {
  const _AuthIllustration({
    required this.mode,
    required this.isDark,
    required this.spin,
    required this.onToggleTheme,
  });

  final _AuthMode mode;
  final bool isDark;
  final Animation<double> spin;
  final VoidCallback onToggleTheme;

  @override
  Widget build(BuildContext context) {
    final (viewW, viewH) = switch (mode) {
      _AuthMode.register => (240.0, 150.0),
      _AuthMode.forgot => (200.0, 160.0),
      _AuthMode.login => (240.0, 180.0),
    };
    final boxW = 260.0; // ~62% of the 420dp column, like the web's 240/384
    final boxH = boxW * viewH / viewW;
    final sx = boxW / viewW;
    final sy = boxH / viewH;
    // Center of the web's foreignObject theme-toggle.
    final (sunX, sunY) = switch (mode) {
      _AuthMode.register => (195.0, 45.0),
      _AuthMode.forgot => (100.0, 40.0),
      _AuthMode.login => (190.0, 40.0),
    };
    return SizedBox(
      width: boxW,
      height: boxH,
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _AuthIllustrationPainter(mode: mode, isDark: isDark),
            ),
          ),
          Positioned(
            left: (sunX - 15) * sx,
            top: (sunY - 15) * sy,
            width: 30 * sx,
            height: 30 * sy,
            child: BrandSunMoonToggle(
              isDark: isDark,
              spin: spin,
              bg: isDark ? DesignColors.dark.scaffold : DesignColors.light.scaffold,
              onTap: onToggleTheme,
            ),
          ),
        ],
      ),
    );
  }
}

class _AuthIllustrationPainter extends CustomPainter {
  const _AuthIllustrationPainter({required this.mode, required this.isDark});

  final _AuthMode mode;
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final c = isDark ? DesignColors.dark : DesignColors.light;
    final (viewW, viewH) = switch (mode) {
      _AuthMode.register => (240.0, 150.0),
      _AuthMode.forgot => (200.0, 160.0),
      _AuthMode.login => (240.0, 180.0),
    };
    // Uniform scale keeps the artwork proportional even if the box is
    // somehow sized non-square.
    final s = math.min(size.width / viewW, size.height / viewH);
    canvas.scale(s, s);

    switch (mode) {
      case _AuthMode.login:
        _paintHouse(canvas, c);
      case _AuthMode.register:
        _paintRegister(canvas, c);
      case _AuthMode.forgot:
        _paintEnvelope(canvas, c);
    }
  }

  // ---- Login: the house ----
  void _paintHouse(Canvas canvas, DesignColors c) {
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()..style = PaintingStyle.fill;

    // Ground (opacity 0.3).
    stroke.color = c.emerald.withValues(alpha: 0.3);
    stroke.strokeWidth = 2;
    canvas.drawLine(const Offset(40, 160), const Offset(200, 160), stroke);

    // House body.
    stroke.color = c.emerald;
    stroke.strokeWidth = 3;
    final house = RRect.fromRectAndRadius(
      const Rect.fromLTWH(70, 60, 100, 100),
      const Radius.circular(4),
    );
    fill.color = c.illustrationFill;
    canvas.drawRRect(house, fill);
    canvas.drawRRect(house, stroke);

    // Roof.
    final roof = Path()
      ..moveTo(60, 60)
      ..lineTo(120, 20)
      ..lineTo(180, 60)
      ..close();
    fill.color = c.illustrationFill;
    canvas.drawPath(roof, fill);
    canvas.drawPath(roof, stroke);

    // Door.
    final door = RRect.fromRectAndRadius(
      const Rect.fromLTWH(105, 110, 30, 50),
      const Radius.circular(1),
    );
    fill.color = c.illustrationDeep;
    canvas.drawRRect(door, fill);
    stroke.color = c.emerald;
    stroke.strokeWidth = 2;
    canvas.drawRRect(door, stroke);

    // Doorknob.
    fill.color = c.illustrationAmber;
    canvas.drawCircle(const Offset(130, 135), 2, fill);

    // Window (lit).
    final window = RRect.fromRectAndRadius(
      const Rect.fromLTWH(85, 80, 20, 20),
      const Radius.circular(1),
    );
    fill.color = c.illustrationWindow;
    canvas.drawRRect(window, fill);
    stroke.color = c.emerald;
    stroke.strokeWidth = 2;
    canvas.drawRRect(window, stroke);
    stroke.color = c.illustrationCross;
    stroke.strokeWidth = 1;
    canvas.drawLine(const Offset(95, 80), const Offset(95, 100), stroke);
    canvas.drawLine(const Offset(85, 90), const Offset(105, 90), stroke);

    // Bush.
    stroke.color = c.emerald;
    stroke.strokeWidth = 2;
    canvas.drawLine(const Offset(150, 160), const Offset(150, 140), stroke);
    fill.color = c.emerald.withValues(alpha: 0.8);
    canvas.drawCircle(const Offset(150, 135), 8, fill);

    // Welcome mat.
    final mat = RRect.fromRectAndRadius(
      const Rect.fromLTWH(100, 160, 40, 3),
      const Radius.circular(1.5),
    );
    fill.color = c.illustrationAmber;
    canvas.drawRRect(mat, fill);
  }

  // ---- Register: people + plus badge ----
  void _paintRegister(Canvas canvas, DesignColors c) {
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()..style = PaintingStyle.fill;
    final joinColor = isDark ? c.emerald : c.emeraldDeep;

    // Background circle.
    fill.color = c.illustrationDeep.withValues(alpha: 0.5);
    canvas.drawCircle(const Offset(120, 75), 50, fill);

    // Person 1 (background member).
    fill.color = c.illustrationPerson;
    stroke.color = c.emerald;
    stroke.strokeWidth = 2;
    canvas.drawCircle(const Offset(75, 65), 15, fill);
    canvas.drawCircle(const Offset(75, 65), 15, stroke);
    final p1 = Path()
      ..moveTo(75, 85)
      ..cubicTo(60, 85, 50, 95, 50, 110)
      ..lineTo(100, 110)
      ..cubicTo(100, 95, 90, 85, 75, 85)
      ..close();
    canvas.drawPath(p1, fill);
    canvas.drawPath(p1, stroke);

    // Person 2 (the new member).
    fill.color = joinColor;
    canvas.drawCircle(const Offset(120, 65), 18, fill);
    if (isDark) {
      stroke.color = Colors.white;
      stroke.strokeWidth = 1;
      canvas.drawCircle(const Offset(120, 65), 18, stroke);
    }
    final p2 = Path()
      ..moveTo(120, 88)
      ..cubicTo(140, 88, 155, 98, 155, 115)
      ..lineTo(85, 115)
      ..cubicTo(85, 98, 100, 88, 120, 88)
      ..close();
    canvas.drawPath(p2, fill);

    // Plus badge on the new member.
    fill.color = c.illustrationAmber;
    canvas.drawCircle(const Offset(145, 60), 10, fill);
    stroke.color = isDark ? Colors.black : Colors.white;
    stroke.strokeWidth = 2.5;
    canvas.drawLine(const Offset(145, 55), const Offset(145, 65), stroke);
    canvas.drawLine(const Offset(140, 60), const Offset(150, 60), stroke);

    // Sparkles.
    stroke.color = c.illustrationAmber;
    stroke.strokeWidth = 2;
    canvas.drawLine(const Offset(170, 40), const Offset(175, 45), stroke);
    canvas.drawLine(const Offset(180, 35), const Offset(175, 30), stroke);
    fill.color = c.illustrationAmber;
    canvas.drawCircle(const Offset(185, 50), 2, fill);
    stroke.color = c.emerald;
    canvas.drawLine(const Offset(60, 40), const Offset(55, 45), stroke);
    canvas.drawLine(const Offset(50, 35), const Offset(55, 30), stroke);
    fill.color = c.emerald;
    canvas.drawCircle(const Offset(45, 50), 2, fill);

    // Dash-member (the next space).
    stroke.color = c.emerald;
    stroke.strokeWidth = 1.5;
    _dashPath(
      canvas,
      Path()..addOval(Rect.fromCircle(center: const Offset(165, 65), radius: 12)),
      stroke,
    );
    final dashBody = Path()
      ..moveTo(165, 85)
      ..cubicTo(155, 85, 145, 92, 145, 105)
      ..lineTo(185, 105)
      ..cubicTo(185, 92, 175, 85, 165, 85)
      ..close();
    _dashPath(canvas, dashBody, stroke);
  }

  // ---- Forgot password: envelope ----
  void _paintEnvelope(Canvas canvas, DesignColors c) {
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()..style = PaintingStyle.fill;

    final body = RRect.fromRectAndRadius(
      const Rect.fromLTWH(50, 70, 100, 60),
      const Radius.circular(4),
    );
    fill.color = c.illustrationPerson;
    canvas.drawRRect(body, fill);
    stroke.color = c.emerald;
    stroke.strokeWidth = 2;
    canvas.drawRRect(body, stroke);

    // Flap.
    final flap = Path()
      ..moveTo(50, 70)
      ..lineTo(100, 100)
      ..lineTo(150, 70);
    canvas.drawPath(flap, stroke);

    // Side seams.
    stroke.color = c.emerald.withValues(alpha: 0.3);
    stroke.strokeWidth = 1;
    canvas.drawLine(const Offset(50, 130), const Offset(85, 105), stroke);
    canvas.drawLine(const Offset(150, 130), const Offset(115, 105), stroke);
  }

  static void _dashPath(
    Canvas canvas,
    Path path,
    Paint paint, {
    double dash = 4,
    double gap = 4,
  }) {
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final next = math.min(distance + dash, metric.length);
        canvas.drawPath(metric.extractPath(distance, next), paint);
        distance = next + gap;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _AuthIllustrationPainter oldDelegate) =>
      oldDelegate.isDark != isDark || oldDelegate.mode != mode;
}

/// Three-bar password strength meter (web: weak/medium/strong color rules).
class _StrengthMeter extends StatelessWidget {
  const _StrengthMeter({required this.strength});

  final String strength;

  @override
  Widget build(BuildContext context) {
    const track = Color(0xFF3F3F46); // zinc-700
    const red = Color(0xFFEF4444);
    const yellow = Color(0xFFEAB308);
    const green = Color(0xFF22C55E);

    final Color bar1;
    final Color bar2;
    final Color bar3;
    switch (strength) {
      case 'strong':
        bar1 = track;
        bar2 = green;
        bar3 = green;
      case 'medium':
        bar1 = track;
        bar2 = yellow;
        bar3 = track;
      default:
        bar1 = red;
        bar2 = track;
        bar3 = track;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 6),
      child: Row(
        children: [
          Expanded(child: _bar(bar1)),
          const SizedBox(width: 6),
          Expanded(child: _bar(bar2)),
          const SizedBox(width: 6),
          Expanded(child: _bar(bar3)),
        ],
      ),
    );
  }

  Widget _bar(Color color) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      height: 4,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(9999),
      ),
    );
  }
}

/// "I agree to the Terms of Service and Privacy Policy" checkbox.
class _TermsCheckbox extends StatelessWidget {
  const _TermsCheckbox({
    required this.c,
    required this.value,
    required this.onChanged,
  });

  final DesignColors c;
  final bool value;
  final ValueChanged<bool?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: value,
            onChanged: onChanged,
            activeColor: c.accent,
            side: BorderSide(color: c.inputBorder, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 3),
            child: Text.rich(
              TextSpan(
                style: TextStyle(color: c.textMuted, fontSize: 12.5),
                children: [
                  const TextSpan(text: 'I agree to the '),
                  _link('Terms of Service'),
                  const TextSpan(text: ' and '),
                  _link('Privacy Policy'),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  TextSpan _link(String label) {
    return TextSpan(
      text: label,
      style: TextStyle(
        color: c.accent,
        fontWeight: FontWeight.w600,
        decoration: TextDecoration.underline,
        decorationColor: c.accent.withValues(alpha: 0.4),
      ),
      recognizer: null,
    );
  }
}

