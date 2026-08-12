import 'dart:math' as math;

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/property.dart';
import '../theme.dart';

/// Google Map centered on Westlands, Nairobi — markers for every property
/// within a 20 km radius that has coordinates.
class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const LatLng _westlands = LatLng(-1.2465, 36.7861);

  late Future<List<Property>> _propertiesFuture;

  @override
  void initState() {
    super.initState();
    _propertiesFuture = _loadProperties();
  }

  Future<List<Property>> _loadProperties() async {
    final snap = await FirebaseFirestore.instance.collection('properties').get();
    return snap.docs
        .map(Property.fromFirestore)
        .where((p) =>
            p.hasCoordinates && _distanceKm(_westlands, LatLng(p.lat!, p.lng!)) <= 20)
        .toList();
  }

  static double _distanceKm(LatLng a, LatLng b) {
    const r = 6371.0;
    final dLat = _rad(b.latitude - a.latitude);
    final dLng = _rad(b.longitude - a.longitude);
    final h = math.pow(math.sin(dLat / 2), 2) +
        math.cos(_rad(a.latitude)) *
            math.cos(_rad(b.latitude)) *
            math.pow(math.sin(dLng / 2), 2);
    return 2 * r * math.asin(math.sqrt(h.toDouble()));
  }

  static double _rad(double deg) => deg * math.pi / 180;


  void _showSheet(Property p) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: c.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (p.images.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 140,
                  width: double.infinity,
                  child: Image.network(
                    p.images.first,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: c.surfaceElevated,
                      child: Icon(Icons.image_not_supported_outlined,
                          color: c.textMuted),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Text(
              p.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontWeight: FontWeight.w700,
                fontSize: 16,
                color: c.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              p.priceLabel,
              style: TextStyle(
                color: c.emerald,
                fontWeight: FontWeight.w800,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${p.address}${p.city.isNotEmpty ? ', ${p.city}' : ''}',
              style: TextStyle(color: c.textMuted, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Property>>(
      future: _propertiesFuture,
      builder: (context, snapshot) {
        final c = themeController.isDark ? kDesignDark : kDesignLight;
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final props = snapshot.data ?? const <Property>[];
        // Markers are derived purely from the fetched data each build — no
        // setState here, so there's no rebuild loop.
        final markers = <Marker>{
          for (final p in props)
            Marker(
              markerId: MarkerId(p.id),
              position: LatLng(p.lat!, p.lng!),
              infoWindow: InfoWindow(title: p.priceLabel),
              onTap: () => _showSheet(p),
            ),
        };
        return Stack(
          children: [
            GoogleMap(
              initialCameraPosition: const CameraPosition(
                target: _westlands,
                zoom: 12.5,
              ),
              markers: markers,
              myLocationEnabled: true,
            ),
            Positioned(
              left: 16,
              bottom: 24,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: c.surface,
                  borderRadius: BorderRadius.circular(30),
                  border:
                      Border.all(color: const Color(0xFF51FAAA), width: 1.2),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.home_work,
                        size: 16, color: Color(0xFF51FAAA)),
                    const SizedBox(width: 6),
                    Text(
                      '${props.length} properties near Westlands',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: c.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
