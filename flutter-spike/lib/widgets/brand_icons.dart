import 'package:flutter/material.dart';

/// The lucide "Chrome" icon (black, stroke-only) used on the auth page's
/// Google button — `<Chrome size={20}/>` from lucide-react.
class BrandChromeIcon extends StatelessWidget {
  const BrandChromeIcon({super.key, required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: const _ChromeIconPainter(),
    );
  }
}

class _ChromeIconPainter extends CustomPainter {
  const _ChromeIconPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24;
    canvas.scale(s);

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = const Color(0xFF111827); // text-black

    canvas.drawCircle(const Offset(12, 12), 10, paint);
    canvas.drawCircle(const Offset(12, 12), 4, paint);
    canvas.drawLine(const Offset(21.17, 8), const Offset(12, 8), paint);
    canvas.drawLine(const Offset(3.95, 6.06), const Offset(8.54, 14), paint);
    canvas.drawLine(const Offset(10.88, 21.94), const Offset(15.46, 14), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// The lucide "UserCheck" icon (person + checkmark) used on the web's
/// Agent/Landlord toggle — `<UserCheck size={16}/>` from lucide-react.
class BrandUserCheckIcon extends StatelessWidget {
  const BrandUserCheckIcon({super.key, required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _UserCheckIconPainter(color: color),
    );
  }
}

class _UserCheckIconPainter extends CustomPainter {
  const _UserCheckIconPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24;
    canvas.scale(s);

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = color;

    // Head.
    canvas.drawCircle(const Offset(9, 7), 4, paint);
    // Shoulders: M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2
    final shoulders = Path()
      ..moveTo(2, 21)
      ..lineTo(2, 19)
      ..quadraticBezierTo(2, 15, 6, 15)
      ..lineTo(12, 15)
      ..quadraticBezierTo(16, 15, 16, 19)
      ..lineTo(16, 21);
    canvas.drawPath(shoulders, paint);
    // Checkmark: m16 11 2 2 4-4
    final check = Path()
      ..moveTo(16, 11)
      ..lineTo(18, 13)
      ..lineTo(22, 9);
    canvas.drawPath(check, paint);
  }

  @override
  bool shouldRepaint(covariant _UserCheckIconPainter oldDelegate) =>
      oldDelegate.color != color;
}
