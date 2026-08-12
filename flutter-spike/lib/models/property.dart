import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

/// Mirrors the web app's property shape (`client/src`).
///
/// Coordinates intentionally accept every format the web app's
/// `getNormalizedLatLng` handles, so the spike works with the live seed data
/// without migrations:
///  - Firestore `GeoPoint` at `coordinates`
///  - `{ lat, lng }` at `coordinates`, `location`, or the doc root
class Property {
  final String id;
  final String title;
  final String address;
  final String city;
  final num? price;
  final String listingType; // 'rent' | 'sale'
  final int beds;
  final int baths;
  final List<String> images;
  final int views;
  final double? lat;
  final double? lng;

  const Property({
    required this.id,
    required this.title,
    required this.address,
    required this.city,
    this.price,
    this.listingType = 'sale',
    this.beds = 0,
    this.baths = 0,
    this.images = const [],
    this.views = 0,
    this.lat,
    this.lng,
  });

  bool get hasCoordinates => lat != null && lng != null;

  String get priceLabel {
    final p = price;
    if (p == null) return 'Price on request';
    final n = NumberFormat.decimalPattern('en');
    return 'Ksh ${n.format(p)}';
  }

  factory Property.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    return Property.fromMap(doc.data() ?? const <String, dynamic>{}, id: doc.id);
  }

  /// Builds a property from a raw Firestore data map. Kept separate from
  /// [fromFirestore] so it's trivially unit-testable without Firestore.
  factory Property.fromMap(Map<String, dynamic> d, {required String id}) {

    double? lat;
    double? lng;
    final dynamic coords = d['coordinates'];
    final dynamic location = d['location'];
    if (coords is GeoPoint) {
      lat = coords.latitude;
      lng = coords.longitude;
    } else if (coords is Map) {
      lat = _numOrNull(coords['lat'] ?? coords['latitude']);
      lng = _numOrNull(coords['lng'] ?? coords['longitude']);
    } else if (location is Map) {
      lat = _numOrNull(location['lat']);
      lng = _numOrNull(location['lng']);
    } else {
      lat = _numOrNull(d['lat']);
      lng = _numOrNull(d['lng']);
    }

    final images = d['images'];
    final List<String> imageList = images is List
        ? images.whereType<String>().toList()
        : (d['image'] is String ? [d['image'] as String] : const <String>[]);

    // The web writes `location: { address, city, ... }`; older seed rows
    // keep address/city at the doc root. Read both.
    var address = (d['address'] as String?) ?? '';
    var city = (d['city'] as String?) ?? '';
    final dynamic loc = d['location'];
    if (loc is Map) {
      address = (loc['address'] as String?) ?? address;
      city = (loc['city'] as String?) ?? city;
    }

    // Listing type: `listing_type` ('sale'|'rent'), else the web's
    // `status` ('for-sale'|'for-rent'), else default to sale.
    var listingType = (d['listing_type'] as String?) ?? 'sale';
    if (listingType != 'sale' && listingType != 'rent') {
      listingType = (d['status'] as String?) == 'for-rent' ? 'rent' : 'sale';
    }

    return Property(
      id: id,
      title: (d['title'] as String?) ?? '',
      address: address,
      city: city,
      price: _numOrNull(d['price']),
      listingType: listingType,
      beds: _intOrZero(d['beds'] ?? d['bedrooms']),
      baths: _intOrZero(d['baths'] ?? d['bathrooms']),
      images: imageList,
      views: _intOrZero(d['views']),
      lat: lat,
      lng: lng,
    );
  }

  static double? _numOrNull(dynamic v) {
    if (v is num) return v.toDouble();
    if (v is String) return double.tryParse(v);
    return null;
  }

  static int _intOrZero(dynamic v) {
    if (v is num) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }
}

