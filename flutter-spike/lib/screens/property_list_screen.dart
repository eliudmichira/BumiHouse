import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import '../models/property.dart';
import '../theme.dart';
import '../widgets/brand_button.dart';

/// Live list of properties from Firestore's `properties` collection — the
/// same collection the web app reads. Mirrors `MobilePropertyList.jsx`:
/// theme-aware search bar + status chips + the mobile property card
/// (rounded-2xl border card, 4:3 image with scrim/badge/heart, bold price,
/// emerald "View details" button). Filters are applied client-side so the
/// spike needs no Firestore indexes.
class PropertyListScreen extends StatefulWidget {
  const PropertyListScreen({super.key});

  @override
  State<PropertyListScreen> createState() => _PropertyListScreenState();
}

class _PropertyListScreenState extends State<PropertyListScreen> {
  final _search = TextEditingController();
  String _type = 'all'; // 'all' | 'rent' | 'sale'

  DesignColors get _c => themeController.isDark ? kDesignDark : kDesignLight;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Stream<List<Property>> _stream() {
    return FirebaseFirestore.instance
        .collection('properties')
        .snapshots()
        .map((snap) => snap.docs.map(Property.fromFirestore).toList());
  }

  List<Property> _filter(List<Property> all) {
    final q = _search.text.trim().toLowerCase();
    return all.where((p) {
      if (_type != 'all' && p.listingType != _type) return false;
      if (q.isEmpty) return true;
      return p.address.toLowerCase().contains(q) ||
          p.city.toLowerCase().contains(q) ||
          p.title.toLowerCase().contains(q);
    }).toList();
  }

  void _showDetails(Property p) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: _c.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _PropertyDetailsSheet(property: p, c: _c),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = _c;
    return Column(
      children: [
        // Sticky search + filter chips — web: sticky top-0 backdrop-blur.
        Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
          decoration: BoxDecoration(
            color: c.scaffold.withValues(alpha: 0.95),
            border: Border(bottom: BorderSide(color: c.inputBorder, width: 1)),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _search,
                      onChanged: (_) => setState(() {}),
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 13,
                        color: c.inputText,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Search location or address',
                        hintStyle: TextStyle(color: c.textMuted, fontSize: 13),
                        prefixIcon: Icon(Icons.search, size: 18, color: c.textMuted),
                        suffixIcon: _search.text.isEmpty
                            ? null
                            : IconButton(
                                icon: Icon(Icons.clear, size: 16, color: c.textMuted),
                                onPressed: () {
                                  _search.clear();
                                  setState(() {});
                                },
                              ),
                        isDense: true,
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        filled: true,
                        fillColor: c.inputFill,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: c.inputBorder, width: 1),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: c.inputBorder, width: 1),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                              color: Color(0xFF51FAAA), width: 1.5),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Filter button — emerald when a chip is active, like the web.
                  Container(
                    height: 40,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: _type != 'all'
                          ? const Color(0xFF51FAAA)
                          : c.inputFill,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _type != 'all'
                            ? const Color(0xFF51FAAA)
                            : c.inputBorder,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.tune,
                          size: 16,
                          color: _type != 'all'
                              ? const Color(0xFF0A0C19)
                              : c.textSecondary,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          'Filter',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: _type != 'all'
                                ? const Color(0xFF0A0C19)
                                : c.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Status chips — web: rounded-full pills, active = #51faaa.
              Row(
                children: [
                  _StatusChip(
                    label: 'All',
                    active: _type == 'all',
                    c: c,
                    onTap: () => setState(() => _type = 'all'),
                  ),
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: 'For Sale',
                    active: _type == 'sale',
                    c: c,
                    onTap: () => setState(() => _type = 'sale'),
                  ),
                  const SizedBox(width: 8),
                  _StatusChip(
                    label: 'For Rent',
                    active: _type == 'rent',
                    c: c,
                    onTap: () => setState(() => _type = 'rent'),
                  ),
                ],
              ),
            ],
          ),
        ),
        Expanded(
          child: StreamBuilder<List<Property>>(
            stream: _stream(),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: c.error.withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.close, size: 32, color: c.error),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Error loading properties',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: c.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          '${snapshot.error}',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: c.textMuted, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: () => setState(() {}),
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                );
              }
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(
                        width: 32,
                        height: 32,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Color(0xFF51FAAA),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Loading properties...',
                        style: TextStyle(color: c.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                );
              }
              final items = _filter(snapshot.data ?? const []);
              if (items.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: c.surface,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.home_outlined,
                          size: 32,
                          color: c.textMuted,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No properties found',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: c.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _search.text.trim().isEmpty
                            ? 'No properties available at the moment'
                            : 'Try adjusting your search criteria',
                        style: TextStyle(color: c.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                itemCount: items.length,
                itemBuilder: (context, i) => _PropertyCard(
                  property: items[i],
                  c: c,
                  onViewDetails: () => _showDetails(items[i]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Web `.statusFilters` chip — rounded-full pill; active = #51faaa with
/// #0a0c19 text, inactive = transparent with a hairline border.
class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.active,
    required this.c,
    required this.onTap,
  });

  final String label;
  final bool active;
  final DesignColors c;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF51FAAA) : Colors.transparent,
          borderRadius: BorderRadius.circular(9999),
          border: Border.all(
            color: active
                ? const Color(0xFF51FAAA)
                : c.inputBorder,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: active
                ? const Color(0xFF0A0C19)
                : c.textMuted,
          ),
        ),
      ),
    );
  }
}

/// Mobile property card — mirrors `MobilePropertyCard` in
/// `MobilePropertyList.jsx`: rounded-2xl border card, 4:3 image with top
/// scrim + status badge + heart, bold price, 14px title, location row, and
/// a divider row of emerald bed/bath icons plus the #51faaa View details
/// button.
class _PropertyCard extends StatelessWidget {
  const _PropertyCard({
    required this.property,
    required this.c,
    required this.onViewDetails,
  });

  final Property property;
  final DesignColors c;
  final VoidCallback onViewDetails;

  String get _badge =>
      property.listingType == 'rent' ? 'For Rent' : 'For Sale';

  @override
  Widget build(BuildContext context) {
    final photo = property.images.isNotEmpty ? property.images.first : null;
    return GestureDetector(
      onTap: onViewDetails,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: c.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: c.inputBorder, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 4:3 image with the web's top scrim + status badge + heart.
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (photo == null)
                    Container(
                      color: c.surfaceElevated,
                      child: Icon(
                        Icons.image_not_supported_outlined,
                        size: 40,
                        color: c.textMuted,
                      ),
                    )
                  else
                    Image.network(
                      photo,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: c.surfaceElevated,
                        child: Icon(
                          Icons.image_not_supported_outlined,
                          size: 40,
                          color: c.textMuted,
                        ),
                      ),
                    ),
                  // Top scrim so the badge and heart stay legible.
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0x66000000), Color(0x00000000)],
                        stops: [0.0, 1.0],
                      ),
                    ),
                  ),
                  // Status badge — web: black/50 blur pill, emerald dot.
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(9999),
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.15)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Color(0xFF51FAAA),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _badge.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Heart — web: black/30 blur circle.
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: const Icon(
                        Icons.favorite_border,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price — web: 22px bold.
                  Text(
                    property.priceLabel,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      height: 1.1,
                      letterSpacing: -0.3,
                      color: c.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    property.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: c.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined,
                          size: 12, color: c.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${property.address}${property.city.isNotEmpty ? ', ${property.city}' : ''}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                              color: c.textMuted, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Divider(height: 1, color: c.inputBorder),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      if (property.beds > 0) ...[
                        const Icon(Icons.bed_outlined,
                            size: 14, color: Color(0xFF51FAAA)),
                        const SizedBox(width: 5),
                        Text(
                          '${property.beds} bd',
                          style: TextStyle(
                            color: c.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 16),
                      ],
                      if (property.baths > 0) ...[
                        const Icon(Icons.bathtub_outlined,
                            size: 14, color: Color(0xFF51FAAA)),
                        const SizedBox(width: 5),
                        Text(
                          '${property.baths} ba',
                          style: TextStyle(
                            color: c.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  // View details — the brand CTA from the auth pages
                  // (BrandButton) with the web's emerald→gold primary
                  // gradient and its `shadow-sm shadow-[#51faaa]/20` glow.
                  BrandButton(
                    gradient: DesignGradients.primary,
                    foregroundColor: const Color(0xFF0A0C19),
                    onPressed: onViewDetails,
                    shadows: [
                      BoxShadow(
                        color: const Color(0xFF51FAAA).withValues(alpha: 0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'View details',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.2,
                            color: Color(0xFF0A0C19),
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward,
                            size: 16, color: Color(0xFF0A0C19)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Bottom-sheet details — theme-aware stand-in for the web's `/property/:id`
/// page, reusing the map screen's sheet but styled with the design tokens.
class _PropertyDetailsSheet extends StatelessWidget {
  const _PropertyDetailsSheet({required this.property, required this.c});

  final Property property;
  final DesignColors c;

  @override
  Widget build(BuildContext context) {
    final photo = property.images.isNotEmpty ? property.images.first : null;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: c.textMuted.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (photo != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: AspectRatio(
                aspectRatio: 4 / 3,
                child: Image.network(
                  photo,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: c.surfaceElevated,
                    child: Icon(Icons.image_not_supported_outlined,
                        color: c.textMuted),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],
          Text(
            property.priceLabel,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 24,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
              color: c.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            property.title,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: c.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.location_on_outlined, size: 14, color: c.textMuted),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  '${property.address}${property.city.isNotEmpty ? ', ${property.city}' : ''}',
                  style: TextStyle(color: c.textMuted, fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (property.beds > 0) ...[
                const Icon(Icons.bed_outlined,
                    size: 16, color: Color(0xFF51FAAA)),
                const SizedBox(width: 5),
                Text('${property.beds} bd',
                    style: TextStyle(
                        color: c.textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
                const SizedBox(width: 18),
              ],
              if (property.baths > 0) ...[
                const Icon(Icons.bathtub_outlined,
                    size: 16, color: Color(0xFF51FAAA)),
                const SizedBox(width: 5),
                Text('${property.baths} ba',
                    style: TextStyle(
                        color: c.textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
                const SizedBox(width: 18),
              ],
              Icon(Icons.visibility_outlined,
                  size: 16, color: c.textMuted),
              const SizedBox(width: 5),
              Text('${property.views} views',
                  style: TextStyle(
                      color: c.textMuted,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}
