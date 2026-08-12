import 'dart:math' as math;

import 'package:flutter/material.dart';

/// The brand theme toggle: an amber Sun (dark mode, slowly spinning) or a
/// black Moon (light mode). Tapping flips the theme — same as the web's
/// sun/moon on the auth illustration. Used on the auth screen and, without
/// a spin controller, in the app header so the theme is switchable app-wide.
class BrandSunMoonToggle extends StatelessWidget {
  const BrandSunMoonToggle({
    super.key,
    required this.isDark,
    required this.bg,
    required this.onTap,
    this.spin,
  });

  final bool isDark;

  /// Page background color — the moon's crescent cut-out is painted with
  /// this so it blends into whatever surface it sits on.
  final Color bg;

  final VoidCallback onTap;

  /// Optional slow-spin animation for the sun. When null the toggle is
  /// static (e.g. in an app-bar header).
  final Animation<double>? spin;

  @override
  Widget build(BuildContext context) {
    final turns = spin ?? const AlwaysStoppedAnimation<double>(0.0);
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: RotationTransition(
        turns: isDark ? turns : const AlwaysStoppedAnimation(0.0),
        child: CustomPaint(
          painter: isDark
              ? const BrandSunPainter()
              : BrandMoonPainter(bg: bg),
        ),
      ),
    );
  }
}

/// The lucide "Sun" icon the web renders in dark mode — an amber stroked
/// circle with 8 rays (no fill).
class BrandSunPainter extends CustomPainter {
  const BrandSunPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24;
    canvas.scale(s);
    const amber = Color(0xFFFBBF24);
    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    stroke.color = amber;
    stroke.strokeWidth = 2;
    canvas.drawCircle(const Offset(12, 12), 8, stroke);
    for (var i = 0; i < 8; i++) {
      final a = i * math.pi / 4;
      canvas.drawLine(
        Offset(12 + math.cos(a) * 11, 12 + math.sin(a) * 11),
        Offset(12 + math.cos(a) * 15, 12 + math.sin(a) * 15),
        stroke,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// A black crescent moon — a black disc with a page-colored disc cut out.
class BrandMoonPainter extends CustomPainter {
  const BrandMoonPainter({required this.bg});

  final Color bg;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24;
    canvas.scale(s);
    final fill = Paint()..style = PaintingStyle.fill;
    fill.color = const Color(0xFF000000);
    canvas.drawCircle(const Offset(12, 12), 10, fill);
    fill.color = bg;
    canvas.drawCircle(const Offset(16.5, 9.5), 9, fill);
  }

  @override
  bool shouldRepaint(covariant BrandMoonPainter oldDelegate) =>
      oldDelegate.bg != bg;
}
