import 'package:flutter/material.dart';

/// Full-width brand button with a gradient fill, pill shape and optional
/// glow — the same button the auth pages use for Sign In / Create Account.
///
/// Inset highlights from the web's box-shadow spec (Flutter has no inset
/// shadows) are simulated with a foreground gradient clipped to the pill:
/// [glossTop] = white line at the top edge, [glossBottom] = faint black
/// shade at the bottom edge.
class BrandButton extends StatelessWidget {
  const BrandButton({
    super.key,
    required this.gradient,
    required this.foregroundColor,
    required this.onPressed,
    required this.child,
    this.loading = false,
    this.shadows,
    this.border,
    this.glossTop = 0.0,
    this.glossBottom = 0.0,
    this.height,
  });

  final LinearGradient gradient;
  final Color foregroundColor;
  final VoidCallback? onPressed;
  final Widget child;
  final bool loading;
  final List<BoxShadow>? shadows;
  final Border? border;
  final double glossTop;
  final double glossBottom;

  /// Optional fixed height (the web uses h-11 = 44 for in-page CTAs).
  final double? height;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(9999),
        onTap: enabled ? onPressed : null,
        child: Container(
          foregroundDecoration:
              (glossTop > 0 || glossBottom > 0)
                  ? BoxDecoration(
                      borderRadius: BorderRadius.circular(9999),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.white.withValues(alpha: glossTop),
                          Colors.transparent,
                          Colors.transparent,
                          Colors.black.withValues(alpha: glossBottom),
                        ],
                        stops: const [0.0, 0.1, 0.9, 1.0],
                      ),
                    )
                  : null,
          child: Ink(
            padding:
                const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.circular(9999),
              boxShadow: shadows,
              border: border,
            ),
            child: Center(
              child: Opacity(
                opacity: enabled ? 1 : 0.5,
                child: loading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.2,
                          color: foregroundColor,
                        ),
                      )
                    : DefaultTextStyle(
                        style: TextStyle(
                          color: foregroundColor,
                          fontFamily: 'Outfit',
                        ),
                        child: height == null
                            ? child
                            : SizedBox(height: height, child: child),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
