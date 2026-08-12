import 'package:flutter/material.dart';

/// A soft radial "orb" glow used behind the register card (and available
/// for any brand surface). Web: radial-gradient(circle, color 0%,
/// transparent 70%) — a glow that fades by ~70% radius.
class BrandOrb extends StatelessWidget {
  const BrandOrb({
    super.key,
    required this.size,
    required this.color,
    this.peakAlpha = 0.2,
  });

  final double size;
  final Color color;
  final double peakAlpha;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color.withValues(alpha: peakAlpha),
            color.withValues(alpha: peakAlpha * 0.15),
            Colors.transparent,
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
    );
  }
}
