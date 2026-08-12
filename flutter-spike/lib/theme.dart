// HomesKE / BumiHouse design system (mirrors the Capacitor web app):
// tokens from client/src/styles/design-system.css, designSystem.js,
// theme-colors.scss, tailwind.config.js and context/ThemeContext.jsx.
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Color palette for one brightness (dark / light), matching the web app.
@immutable
class DesignColors {
  const DesignColors({
    required this.emerald,
    required this.emeraldDeep,
    required this.accent,
    required this.gold,
    required this.scaffold,
    required this.surface,
    required this.surfaceElevated,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.inputFill,
    required this.inputBorder,
    required this.inputText,
    required this.label,
    required this.toggleTrack,
    required this.toggleBorder,
    required this.toggleActiveUser,
    required this.toggleActiveUserText,
    required this.toggleInactiveText,
    required this.error,
    required this.agentBoxBg,
    required this.agentBoxBorder,
    required this.agentBoxText,
    required this.illustrationFill,
    required this.illustrationPerson,
    required this.illustrationDeep,
    required this.illustrationAmber,
    required this.illustrationWindow,
    required this.illustrationCross,
  });

  // Brand (identical in both themes, like the web).
  final Color emerald; // #51faaa
  final Color emeraldDeep; // #2dd284
  final Color accent; // tailwind emerald-500 = #10b981
  final Color gold; // #dbd5a4

  // Surfaces.
  final Color scaffold;
  final Color surface; // zinc-900 / gray-100
  final Color surfaceElevated;

  // Text.
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color label;

  // Inputs (web: bg-zinc-900/50 border-white/20 vs bg-gray-100 border-black/10).
  final Color inputFill;
  final Color inputBorder;
  final Color inputText;

  // User-type toggle (web: zinc-900/white10 vs gray-100/black5).
  final Color toggleTrack;
  final Color toggleBorder;
  final Color toggleActiveUser; // bg-zinc-800 vs bg-white
  final Color toggleActiveUserText;
  final Color toggleInactiveText;

  final Color error;

  // Agent info box.
  final Color agentBoxBg;
  final Color agentBoxBorder;
  final Color agentBoxText;

  // Auth illustrations (from MobileAuth's AuthIllustration).
  final Color illustrationFill; // house/roof fill
  final Color illustrationPerson; // person body + envelope fill
  final Color illustrationDeep; // door fill / window cross
  final Color illustrationAmber; // sun / mat / plus badge
  final Color illustrationWindow; // lit window fill
  final Color illustrationCross; // window cross stroke

  static const dark = DesignColors(
    emerald: Color(0xFF51FAAA),
    emeraldDeep: Color(0xFF2DD284),
    accent: Color(0xFF10B981),
    gold: Color(0xFFDBD5A4),
    scaffold: Color(0xFF000000),
    surface: Color(0xFF18181B), // zinc-900
    surfaceElevated: Color(0xFF1F2937),
    textPrimary: Color(0xFFFFFFFF),
    textSecondary: Color(0xFFD1D5DB),
    textMuted: Color(0xFF9CA3AF),
    label: Color(0x80FFFFFF), // white/50
    inputFill: Color(0x8018181B), // zinc-900/50
    inputBorder: Color(0x33FFFFFF), // white/20
    inputText: Color(0xFFFFFFFF),
    toggleTrack: Color(0xFF18181B),
    toggleBorder: Color(0x1AFFFFFF), // white/10
    toggleActiveUser: Color(0xFF27272A), // zinc-800
    toggleActiveUserText: Color(0xFFFFFFFF),
    toggleInactiveText: Color(0x80FFFFFF), // white/50
    error: Color(0xFFEF4444),
    agentBoxBg: Color(0x1A10B981), // emerald-500/10
    agentBoxBorder: Color(0x3310B981), // emerald-500/20
    agentBoxText: Color(0xFFA7F3D0), // emerald-200
    illustrationFill: Color(0xFF18181B),
    illustrationPerson: Color(0xFF27272A), // zinc-800
    illustrationDeep: Color(0xFF064E3B), // emerald-900
    illustrationAmber: Color(0xFFFBBF24), // amber-400
    illustrationWindow: Color(0xFF51FAAA),
    illustrationCross: Color(0x80064E3B), // emerald-900/50
  );

  static const light = DesignColors(
    emerald: Color(0xFF51FAAA),
    emeraldDeep: Color(0xFF2DD284),
    accent: Color(0xFF10B981),
    gold: Color(0xFFDBD5A4),
    scaffold: Color(0xFFFFFFFF),
    surface: Color(0xFFF3F4F6), // gray-100
    surfaceElevated: Color(0xFFE5E7EB),
    textPrimary: Color(0xFF000000),
    textSecondary: Color(0xFF374151),
    textMuted: Color(0xFF6B7280),
    label: Color(0x80000000), // black/50
    inputFill: Color(0xFFF3F4F6), // gray-100
    inputBorder: Color(0x1A000000), // black/10
    inputText: Color(0xFF000000),
    toggleTrack: Color(0xFFF3F4F6),
    toggleBorder: Color(0x0D000000), // black/5
    toggleActiveUser: Color(0xFFFFFFFF), // bg-white
    toggleActiveUserText: Color(0xFF000000),
    toggleInactiveText: Color(0x80000000), // black/50
    error: Color(0xFFDC2626),
    agentBoxBg: Color(0xFFECFDF5), // emerald-50
    agentBoxBorder: Color(0xFFD1FAE5), // emerald-100
    agentBoxText: Color(0xFF047857), // emerald-700
    illustrationFill: Color(0xFFFFFFFF),
    illustrationPerson: Color(0xFFF4F4F5), // zinc-100
    illustrationDeep: Color(0xFFD1FAE5), // emerald-100
    illustrationAmber: Color(0xFFF59E0B), // amber-500
    illustrationWindow: Color(0xFFF4F4F5),
    illustrationCross: Color(0x8051FAAA), // emerald-500/50
  );
}

/// Brand gradients (identical in both themes).
class DesignGradients {
  DesignGradients._();

  /// Emerald CTA — the mobile auth page's hardcoded
  /// `linear-gradient(180deg, #51faaa 0%, #51faaa 50%, #2dd284 100%)`.
  static const cta = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF51FAAA), Color(0xFF51FAAA), Color(0xFF2DD284)],
    stops: [0.0, 0.5, 1.0],
  );

  /// White Google-button gradient (mobile auth page).
  static const google = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFFFFFFF), Color(0xFFF5F5F5), Color(0xFFE8E8E8)],
    stops: [0.0, 0.5, 1.0],
  );

  /// In-app primary CTA — the web's `PropertyMobileButton` primary:
  /// `bg-gradient-to-r from-[#51faaa] to-[#dbd5a4]` (emerald to gold).
  static const primary = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [Color(0xFF51FAAA), Color(0xFFDBD5A4)],
  );
}

/// App-wide Material theme built from [colors].
ThemeData buildHomesKeTheme(DesignColors c) {
  final base = ThemeData(
    useMaterial3: true,
    brightness: c.scaffold.computeLuminance() < 0.5
        ? Brightness.dark
        : Brightness.light,
  );

  return base.copyWith(
    colorScheme: base.colorScheme.copyWith(
      primary: c.emerald,
      secondary: c.gold,
      surface: c.surface,
      error: c.error,
    ),
    scaffoldBackgroundColor: c.scaffold,
    textTheme: base.textTheme.apply(
      fontFamily: 'Outfit',
      bodyColor: c.textPrimary,
      displayColor: c.textPrimary,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: c.scaffold,
      elevation: 0,
      foregroundColor: c.textPrimary,
      titleTextStyle: TextStyle(
        fontFamily: 'Outfit',
        fontWeight: FontWeight.w700,
        fontSize: 18,
        letterSpacing: -0.2,
        color: c.textPrimary,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: c.inputFill,
      hintStyle: TextStyle(color: c.textMuted),
      labelStyle: TextStyle(color: c.label),
      floatingLabelStyle: const TextStyle(
        color: Color(0xFF10B981), // emerald-500 focus, like the web
        fontWeight: FontWeight.w600,
      ),
      prefixIconColor: c.textMuted,
      suffixIconColor: c.textMuted,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: c.inputBorder, width: 2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: c.inputBorder, width: 2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF10B981), width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: c.error, width: 2),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: c.error, width: 2),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: c.emerald,
        foregroundColor: c.illustrationFill,
        textStyle: const TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w700,
          fontSize: 15,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9999)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: c.accent,
        side: BorderSide(color: c.inputBorder, width: 1.5),
        textStyle: const TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9999)),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: c.accent,
        textStyle: const TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: c.surfaceElevated,
      indicatorColor: c.emerald.withValues(alpha: 0.2),
      labelTextStyle: WidgetStatePropertyAll(
        TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w600,
          color: c.textSecondary,
        ),
      ),
    ),
    segmentedButtonTheme: SegmentedButtonThemeData(
      style: ButtonStyle(
        backgroundColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected)
                ? c.emerald.withValues(alpha: 0.18)
                : Colors.transparent),
        foregroundColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected)
                ? c.emerald
                : c.textSecondary),
        side: WidgetStatePropertyAll(BorderSide(color: c.inputBorder, width: 1.2)),
        textStyle: const WidgetStatePropertyAll(TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w600,
        )),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: c.surfaceElevated,
      contentTextStyle: TextStyle(
        fontFamily: 'Outfit',
        color: c.textPrimary,
      ),
    ),
  );
}

/// Light + dark palettes.
final kDesignDark = DesignColors.dark;
final kDesignLight = DesignColors.light;

/// Theme state — mirrors the web's ThemeContext: `isDark` defaults to true
/// and is persisted under the `theme` key ('dark' / 'light').
class ThemeController extends ValueNotifier<bool> {
  ThemeController() : super(true);

  static const _key = 'theme';
  bool _loaded = false;

  /// Loads the persisted theme (safe to call once at startup).
  Future<void> load() async {
    if (_loaded) return;
    final prefs = await SharedPreferences.getInstance();
    value = prefs.getString(_key) != 'light';
    _loaded = true;
  }

  bool get isDark => value;

  Future<void> toggle() async {
    value = !value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, value ? 'dark' : 'light');
  }
}

/// Global theme controller for the spike.
final themeController = ThemeController();
