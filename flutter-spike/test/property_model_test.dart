import 'package:bumihouse_spike/models/property.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('parses GeoPoint coordinates', () {
    final p = Property.fromMap({
      'title': '4bdrm in Westlands',
      'address': 'Westlands',
      'city': 'Nairobi',
      'price': 85000,
      'listing_type': 'rent',
      'beds': 4,
      'baths': 3,
      'views': 12,
      'coordinates': const GeoPoint(-1.2465, 36.7861),
    }, id: 'p1');
    expect(p.title, '4bdrm in Westlands');
    expect(p.lat, closeTo(-1.2465, 0.0001));
    expect(p.lng, closeTo(36.7861, 0.0001));
    expect(p.priceLabel, 'Ksh 85,000');
    expect(p.listingType, 'rent');
    expect(p.beds, 4);
    expect(p.hasCoordinates, isTrue);
  });

  test('parses {lat,lng} maps at coordinates, location, and root', () {
    for (final data in [
      {'coordinates': {'lat': -1.1, 'lng': 36.2}},
      {'location': {'lat': -1.1, 'lng': 36.2}},
      {'lat': -1.1, 'lng': 36.2},
    ]) {
      final p = Property.fromMap(data, id: 'x');
      expect(p.lat, closeTo(-1.1, 0.0001), reason: 'data: $data');
      expect(p.lng, closeTo(36.2, 0.0001), reason: 'data: $data');
    }
  });

  test('handles string numerics and missing fields', () {
    final p = Property.fromMap({
      'beds': '4',
      'price': '120000',
      'images': ['http://x/1.jpg', 'http://x/2.jpg'],
    }, id: 'p2');
    expect(p.beds, 4);
    expect(p.price, 120000);
    expect(p.images.length, 2);
    expect(p.address, '');
    expect(p.lat, isNull);
    expect(p.hasCoordinates, isFalse);
    expect(p.priceLabel, 'Ksh 120,000');
  });

  test('falls back to price on request', () {
    final p = Property.fromMap({'title': 'No price'}, id: 'p3');
    expect(p.priceLabel, 'Price on request');
  });
}
