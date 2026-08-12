import 'dart:math' as math;
import 'dart:ui' show ImageFilter;

import 'package:flutter/material.dart';

import 'brand_orb.dart';

/// One slot in the bottom nav — mirrors the web's `PropertyMobileNavItem`.
class BrandNavDestination {
  const BrandNavDestination({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

/// Glassy bottom nav ported from the web's `PropertyMobileBottomNav`:
/// an always-dark backdrop-blur bar (the web hardcodes `bg-gray-900/95`
/// regardless of theme), emerald→gold gradient pills for the active items,
/// and the animated center Add-Property FAB.
class BrandBottomNav extends StatelessWidget {
  const BrandBottomNav({
    super.key,
    required this.left,
    required this.right,
    required this.selectedIndex,
    required this.onSelect,
    required this.onAddProperty,
  });

  final List<BrandNavDestination> left;
  final List<BrandNavDestination> right;
  final int selectedIndex;
  final ValueChanged<int> onSelect;
  final VoidCallback onAddProperty;

  @override
  Widget build(BuildContext context) {
    // Web: `bg-gray-900/95 backdrop-blur-xl border-t border-gray-800`.
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF111827).withValues(alpha: 0.95),
            border: Border(
              top: BorderSide(color: const Color(0xFF1F2937), width: 1),
            ),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        for (var i = 0; i < left.length; i++)
                          _BrandNavItem(
                            destination: left[i],
                            active: selectedIndex == i,
                            onTap: () => onSelect(i),
                          ),
                      ],
                    ),
                  ),
                  BrandAddPropertyFAB(onTap: onAddProperty),
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        for (var i = 0; i < right.length; i++)
                          _BrandNavItem(
                            destination: right[i],
                            active: selectedIndex == left.length + i,
                            onTap: () => onSelect(left.length + i),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A nav slot: `w-16 h-16 rounded-xl`, active = the web's
/// `bg-gradient-to-br from-[#51faaa] to-[#dbd5a4] text-[#0a0c19]
/// shadow-lg shadow-[#51faaa]/30`; inactive = gray-400 text.
class _BrandNavItem extends StatelessWidget {
  const _BrandNavItem({
    required this.destination,
    required this.active,
    required this.onTap,
  });

  final BrandNavDestination destination;
  final bool active;
  final VoidCallback onTap;

  static const _activeText = Color(0xFF0A0C19);
  static const _inactiveText = Color(0xFF9CA3AF); // gray-400

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        width: 64,
        height: 64,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: active
            ? BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF51FAAA), Color(0xFFDBD5A4)],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF51FAAA).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              )
            : null,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              active ? destination.selectedIcon : destination.icon,
              size: 22,
              color: active ? _activeText : _inactiveText,
            ),
            const SizedBox(height: 3),
            Text(
              destination.label,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: active ? _activeText : _inactiveText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The center Add-Property button — the web's `PropertyCenterActionButton`:
/// a 56px circle with a rotating emerald→gold gradient body, a spinning
/// conic ring, a pulsing halo, and an inner glow.
class BrandAddPropertyFAB extends StatefulWidget {
  const BrandAddPropertyFAB({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  State<BrandAddPropertyFAB> createState() => _BrandAddPropertyFABState();
}

class _BrandAddPropertyFABState extends State<BrandAddPropertyFAB>
    with SingleTickerProviderStateMixin {
  late final AnimationController _spin;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _spin.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Add Property',
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _pressed ? 0.92 : 1.0,
          duration: const Duration(milliseconds: 120),
          child: SizedBox(
            width: 84,
            height: 84,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Pulsing halo — the web's animated outer boxShadow glow.
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _spin,
                    builder: (context, _) => Opacity(
                      opacity: 0.7 + 0.3 * math.sin(_spin.value * 2 * math.pi),
                      child: const BrandOrb(
                        size: 84,
                        color: Color(0xFF51FAAA),
                        peakAlpha: 0.35,
                      ),
                    ),
                  ),
                ),
                // Spinning conic ring (web: `-inset-1` conic-gradient ring).
                AnimatedBuilder(
                  animation: _spin,
                  builder: (context, _) => Transform.rotate(
                    angle: _spin.value * 2 * math.pi,
                    child: const CustomPaint(
                      size: Size(64, 64),
                      painter: _ConicRingPainter(),
                    ),
                  ),
                ),
                // Button body — rotating emerald→gold gradient disc.
                AnimatedBuilder(
                  animation: _spin,
                  builder: (context, _) => Transform.rotate(
                    angle: _spin.value * 2 * math.pi,
                    child: Container(
                      width: 56,
                      height: 56,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF51FAAA), Color(0xFFDBD5A4)],
                        ),
                      ),
                    ),
                  ),
                ),
                // Subtle inner glow (web: radial white/15 overlay).
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        Colors.white.withValues(alpha: 0.18),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.6],
                    ),
                  ),
                ),
                const Icon(Icons.add, size: 30, color: Colors.white),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// A gold→emerald sweep ring whose rotation is visible because the sweep
/// doesn't wrap symmetrically.
class _ConicRingPainter extends CustomPainter {
  const _ConicRingPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..shader = const SweepGradient(
        colors: [Color(0xFFDBD5A4), Color(0xFF51FAAA)],
        stops: [0.0, 1.0],
      ).createShader(rect);
    canvas.drawCircle(rect.center, size.width / 2 - 1.5, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
