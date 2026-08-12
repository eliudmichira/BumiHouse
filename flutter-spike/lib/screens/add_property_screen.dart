import 'dart:convert';
import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';

import '../theme.dart';

/// Google Maps Geocoding key — same key as `client/.env.production` and the
/// AndroidManifest meta-data. Used for the "Geocode Address" button.
const _kMapsApiKey = 'AIzaSyBNiLdExXJ2eTR2hoMidYCe3cMWC4KKouw';

/// Flutter port of the web's `MobileAddProperty` page: a 6-step wizard
/// (Basics → Location → Details → Amenities → Media → Review) that writes to
/// the same Firestore `properties` collection with the same document shape as
/// the web's `propertiesAPI.create`. Built on the brand kit / design tokens.
class AddPropertyScreen extends StatefulWidget {
  const AddPropertyScreen({super.key});

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _Unit {
  String id;
  String name;
  num price;
  int bedrooms;
  int bathrooms;
  int area;
  int unitsAvailable;
  String features;

  _Unit({
    required this.id,
    required this.name,
    this.price = 0,
    this.bedrooms = 0,
    this.bathrooms = 0,
    this.area = 0,
    this.unitsAvailable = 1,
    this.features = '',
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'name': name,
        'price': price,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'area': area,
        'unitsAvailable': unitsAvailable,
        'features': features,
      };
}

class _AddPropertyForm {
  // Basics
  String title = '';
  String description = '';
  String price = '';
  String propertyType = ''; // house | apartment | commercial | land
  String status = 'for-sale';
  bool hasMultipleUnits = false;

  // Location
  String address = '';
  String city = '';
  String state = '';
  String googleMapsLink = '';
  String lat = '';
  String lng = '';

  // Details
  String bedrooms = '';
  String bathrooms = '';
  String area = '';
  String parking = '';

  // Amenities
  final List<String> amenities = [];

  // Media — picked files (uploaded on submit).
  final List<XFile> imageFiles = [];

  // Multi-unit configs
  final List<_Unit> units = [];

  // Contact (prefilled from auth)
  String contactName = '';
  String contactEmail = '';
  String contactPhone = '';
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  final _form = _AddPropertyForm();
  final _errors = <String, String>{};
  final _scroll = ScrollController();

  int _step = 1;
  static const _totalSteps = 6;

  bool _loading = false;
  bool _geocoding = false;
  bool _resolvingUrl = false;

  DesignColors get _c => themeController.isDark ? kDesignDark : kDesignLight;

  static const _stepNames = [
    'Basics',
    'Location',
    'Details',
    'Amenities',
    'Media',
    'Review',
  ];

  @override
  void initState() {
    super.initState();
    final user = FirebaseAuth.instance.currentUser;
    _form.contactName = user?.displayName ?? '';
    _form.contactEmail = user?.email ?? '';
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  // ---- Helpers -----------------------------------------------------------

  void _set(void Function() mutate) {
    setState(() {
      mutate();
      _errors.clear();
    });
  }

  void _showToast(String title, String message, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Row(children: [
          Icon(error ? Icons.error_outline : Icons.check_circle_outline,
              color: error ? _c.error : const Color(0xFF51FAAA), size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(fontFamily: 'Outfit', fontSize: 13),
            ),
          ),
        ]),
        backgroundColor: _c.surfaceElevated,
        duration: const Duration(seconds: 3),
      ));
    if (error) setState(() {}); // keep error state consistent
  }

  // ---- Step 2: Geocoding ------------------------------------------------

  /// Port of the web's `parseLatLngFromGoogleMapsUrl` — direct coordinate
  /// strings and Google Maps URL patterns, plus short-URL resolution.
  Future<({String lat, String lng})?> _parseLatLng(String raw) async {
    final clean = raw.trim();
    if (clean.isEmpty) return null;

    // 1. "lat, lng"
    final coordMatch =
        RegExp(r'^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$').firstMatch(clean);
    if (coordMatch != null) {
      return (lat: coordMatch.group(1)!, lng: coordMatch.group(2)!);
    }

    // 2. Google Maps URL patterns
    final latLngRegex = RegExp(r'@(-?\d+\.\d+),(-?\d+\.\d+)');
    final placeRegex = RegExp(r'place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)');
    final queryRegex = RegExp(r'q=(-?\d+\.\d+),(-?\d+\.\d+)');

    Match? m = latLngRegex.firstMatch(clean) ??
        placeRegex.firstMatch(clean) ??
        queryRegex.firstMatch(clean);
    if (m != null) {
      return (lat: m.group(1)!, lng: m.group(2)!);
    }

    // 3. Short URL — resolve via HTTP redirect chain (the web uses a Cloud
    // Function for this; following redirects achieves the same result).
    if (clean.contains('maps.app.goo.gl') || clean.contains('goo.gl/maps')) {
      try {
        final client = HttpClient();
        final req = await client.getUrl(Uri.parse(clean))
          ..followRedirects = true;
        final res = await req.close();
        await res.drain<void>();
        client.close();
        // Final URL after the redirect chain.
        final redirects = res.redirects;
        final resolved =
            redirects.isEmpty ? clean : redirects.last.location.toString();
        m = latLngRegex.firstMatch(resolved) ??
            placeRegex.firstMatch(resolved) ??
            queryRegex.firstMatch(resolved);
        if (m != null) {
          return (lat: m.group(1)!, lng: m.group(2)!);
        }
      } catch (_) {}
    }
    return null;
  }

  Future<void> _handleMapsLinkChange(String value) async {
    _set(() => _form.googleMapsLink = value);
    if (value.trim().isNotEmpty &&
        (value.contains('maps.app.goo.gl') ||
            value.contains('goo.gl/maps') ||
            value.contains('google.com/maps'))) {
      setState(() => _resolvingUrl = true);
      final parsed = await _parseLatLng(value);
      if (!mounted) return;
      setState(() => _resolvingUrl = false);
      if (parsed != null) {
        _set(() {
          _form.lat = parsed.lat;
          _form.lng = parsed.lng;
        });
        _showToast('Location Found', 'Coords: ${parsed.lat}, ${parsed.lng}');
      }
    }
  }

  Future<void> _handleGeocode() async {
    setState(() => _geocoding = true);
    try {
      String query = '';
      final link = _form.googleMapsLink.trim();
      if (link.isNotEmpty && !link.contains('http')) {
        // Plus Code or place name
        query = link;
      } else {
        query = [
          _form.address,
          _form.city,
          _form.state,
          'Kenya',
        ].where((s) => s.isNotEmpty).join(', ');
      }

      if (query.isEmpty) {
        _showToast('Missing Info', 'Enter an address or map code.', error: true);
        return;
      }

      // If it's a URL, re-try parsing before hitting the API.
      if (link.contains('http')) {
        final parsed = await _parseLatLng(link);
        if (parsed != null) {
          _set(() {
            _form.lat = parsed.lat;
            _form.lng = parsed.lng;
          });
          _showToast('Used Map Link', 'Coords extracted.');
          return;
        }
      }

      final url = 'https://maps.googleapis.com/maps/api/geocode/json'
          '?address=${Uri.encodeQueryComponent(query)}'
          '&components=country:KE&key=$_kMapsApiKey';
      final client = HttpClient();
      final req = await client.getUrl(Uri.parse(url));
      final res = await req.close();
      final body = await res.transform(utf8.decoder).join();
      client.close();
      final data = jsonDecode(body) as Map<String, dynamic>;
      final results = data['results'] as List? ?? const [];
      if (results.isNotEmpty) {
        final first = results.first as Map<String, dynamic>;
        final loc = (first['geometry'] as Map)['location'] as Map;
        _set(() {
          _form.lat = loc['lat'].toString();
          _form.lng = loc['lng'].toString();
        });
        _showToast(
            'Found', 'Location: ${first['formatted_address'] ?? query}');
      } else {
        _showToast('Not Found', 'Could not find location.', error: true);
      }
    } catch (_) {
      _showToast('Error', 'Geocoding failed.', error: true);
    } finally {
      if (mounted) setState(() => _geocoding = false);
    }
  }

  // ---- Media -------------------------------------------------------------

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage(limit: 10);
    if (picked.isEmpty || !mounted) return;

    final remaining = 10 - _form.imageFiles.length;
    if (remaining <= 0) {
      _showToast('Limit Reached', 'Maximum 10 images allowed', error: true);
      return;
    }
    var added = 0;
    for (final f in picked.take(remaining)) {
      final size = await f.length();
      if (size <= 5 * 1024 * 1024) {
        _form.imageFiles.add(f);
        added++;
      } else {
        _showToast('Too Large',
            '${f.name} exceeds 5MB and was skipped.', error: true);
      }
    }
    if (added > 0) setState(() {});
  }

  void _removeImage(int index) {
    setState(() => _form.imageFiles.removeAt(index));
  }

  // ---- Validation --------------------------------------------------------

  bool _validateStep(int step) {
    final e = <String, String>{};
    switch (step) {
      case 1:
        if (_form.title.trim().isEmpty) e['title'] = 'Title required';
        if (_form.propertyType.isEmpty) e['propertyType'] = 'Type required';
        if (!_form.hasMultipleUnits && _form.price.trim().isEmpty) {
          e['price'] = 'Price required';
        }
        if (_form.description.trim().isEmpty) {
          e['description'] = 'Description required';
        }
        break;
      case 2:
        if (_form.address.trim().isEmpty) e['address'] = 'Address required';
        if (_form.city.trim().isEmpty) e['city'] = 'City required';
        final hasLink = _form.googleMapsLink.isNotEmpty;
        if (!hasLink &&
            (_form.lat.isEmpty || _form.lng.isEmpty)) {
          e['coordinates'] = 'Coords or Map Link required';
        }
        break;
    }
    if (e.isNotEmpty) {
      setState(() => _errors.addAll(e));
      _showToast('Incomplete', 'Please fill all required fields.', error: true);
      return false;
    }
    _errors.clear();
    return true;
  }

  void _next() {
    if (!_validateStep(_step)) return;
    setState(() => _step = (_step + 1).clamp(1, _totalSteps));
    _scroll.jumpTo(0);
  }

  void _back() {
    setState(() => _step = (_step - 1).clamp(1, _totalSteps));
    _scroll.jumpTo(0);
  }

  // ---- Submit ------------------------------------------------------------

  Future<void> _submit() async {
    setState(() => _loading = true);
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) throw Exception('Not signed in');
      final uid = user.uid;

      // Upload images to Storage, mirroring the web's paths.
      final uploaded = <String>[];
      if (_form.imageFiles.isNotEmpty) {
        final ts = DateTime.now().millisecondsSinceEpoch;
        for (var i = 0; i < _form.imageFiles.length; i++) {
          final file = _form.imageFiles[i];
          try {
            final path =
                'properties/$uid/${ts}_${i}_${file.name}';
            final ref = FirebaseStorage.instance.ref(path);
            await ref.putFile(File(file.path));
            uploaded.add(await ref.getDownloadURL());
          } catch (err) {
            debugPrint('Upload failed: $err');
          }
        }
      }

      // Multi-unit price = cheapest unit ("Starting From"), like the web.
      var finalPrice = int.tryParse(_form.price) ?? 0;
      if (_form.hasMultipleUnits && _form.units.isNotEmpty) {
        final prices = _form.units
            .map((u) => u.price)
            .where((p) => p > 0)
            .toList();
        if (prices.isNotEmpty) {
          finalPrice =
              prices.reduce((a, b) => a < b ? a : b).toInt();
        }
      }

      final lat = double.tryParse(_form.lat);
      final lng = double.tryParse(_form.lng);
      final data = <String, dynamic>{
        'title': _form.title.trim(),
        'description': _form.description.trim(),
        'price': finalPrice,
        'type': _form.propertyType,
        'status': _form.status,
        'location': {
          'address': _form.address.trim(),
          'city': _form.city.trim(),
          'state': _form.state.trim(),
          'zipCode': '',
          'googleMapsLink': _form.googleMapsLink.trim(),
          'coordinates': {
            'lat': lat != null ? lat.toString() : '',
            'lng': lng != null ? lng.toString() : '',
          },
        },
        'bedrooms': int.tryParse(_form.bedrooms) ?? 0,
        'bathrooms': int.tryParse(_form.bathrooms) ?? 0,
        'area': int.tryParse(_form.area) ?? 0,
        'parking': _form.parking,
        'amenities': _form.amenities,
        'images': uploaded,
        'hasMultipleUnits': _form.hasMultipleUnits,
        'units': _form.hasMultipleUnits
            ? _form.units.map((u) => u.toMap()).toList()
            : [],
        'contact': {
          'name': _form.contactName,
          'email': _form.contactEmail,
          'phone': _form.contactPhone,
          'whatsapp': '',
        },
        'userId': uid,
        'agent': {
          'id': uid,
          'name': _form.contactName,
          'email': _form.contactEmail,
          'phone': _form.contactPhone,
        },
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      };

      await FirebaseFirestore.instance.collection('properties').add(data);
      if (!mounted) return;
      _showToast('Success', 'Property saved successfully!');
      await Future<void>.delayed(const Duration(milliseconds: 1200));
      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (e) {
      debugPrint('Submit failed: $e');
      if (mounted) _showToast('Error', 'Failed to save property.', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ---- Build -------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final c = _c;
    final progress = _step / _totalSteps;

    return Scaffold(
      backgroundColor: c.scaffold,
      body: SafeArea(
        child: Stack(
          children: [
            // Scrollable content
            Column(
              children: [
                _buildHeader(c, progress),
                Expanded(
                  child: SingleChildScrollView(
                    controller: _scroll,
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      switchInCurve: Curves.easeOut,
                      switchOutCurve: Curves.easeIn,
                      transitionBuilder: (child, anim) => SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0.04, 0),
                          end: Offset.zero,
                        ).animate(anim),
                        child: FadeTransition(opacity: anim, child: child),
                      ),
                      child: KeyedSubtree(
                        key: ValueKey<int>(_step),
                        child: _buildStep(c),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            // Fixed footer actions
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _buildFooter(c),
            ),
          ],
        ),
      ),
    );
  }

  // ---- Header ------------------------------------------------------------

  Widget _buildHeader(DesignColors c, double progress) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: BoxDecoration(
        color: c.scaffold.withValues(alpha: 0.94),
        border: Border(bottom: BorderSide(color: c.inputBorder, width: 1)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                icon: Icon(Icons.close, color: c.textPrimary),
                onPressed: () => Navigator.of(context).pop(),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  'Add Property',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: c.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 48),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: c.inputBorder.withValues(alpha: 0.3),
              valueColor: const AlwaysStoppedAnimation(Color(0xFF51FAAA)),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Step $_step of $_totalSteps',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: c.textMuted,
                ),
              ),
              Text(
                _stepNames[_step - 1],
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: c.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---- Footer ------------------------------------------------------------

  Widget _buildFooter(DesignColors c) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        color: c.scaffold.withValues(alpha: 0.94),
        border: Border(top: BorderSide(color: c.inputBorder, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (_step > 1) ...[
              Expanded(
                child: _FooterButton(
                  label: 'Back',
                  icon: Icons.chevron_left,
                  gradient: null,
                  onPressed: _loading ? null : _back,
                ),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              flex: 2,
              child: _FooterButton(
                label: _step < _totalSteps
                    ? 'Next'
                    : (_loading ? 'Saving...' : 'Submit Property'),
                icon: _step < _totalSteps
                    ? Icons.chevron_right
                    : (_loading ? null : Icons.check),
                gradient: DesignGradients.primary,
                loading: _loading,
                onPressed: _loading
                    ? null
                    : (_step < _totalSteps ? _next : _submit),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---- Steps -------------------------------------------------------------

  Widget _buildStep(DesignColors c) {
    switch (_step) {
      case 1:
        return _StepBasics(form: _form, errors: _errors, c: c, set: _set);
      case 2:
        return _StepLocation(
          form: _form,
          errors: _errors,
          c: c,
          set: _set,
          onMapsLinkChange: _handleMapsLinkChange,
          onGeocode: _handleGeocode,
          geocoding: _geocoding,
          resolvingUrl: _resolvingUrl,
        );
      case 3:
        return _StepDetails(form: _form, c: c, set: _set);
      case 4:
        return _StepAmenities(form: _form, c: c, set: _set);
      case 5:
        return _StepMedia(
          files: _form.imageFiles,
          c: c,
          onPick: _pickImages,
          onRemove: _removeImage,
        );
      case 6:
        return _StepReview(form: _form, c: c);
      default:
        return const SizedBox.shrink();
    }
  }
}

// ===========================================================================
// Shared step building blocks (the web's step-card / input design tokens)
// ===========================================================================

Color _cardColor(DesignColors c) =>
    themeController.isDark ? const Color(0xFF10121E) : Colors.white;

Color _inputFill(DesignColors c) =>
    themeController.isDark ? const Color(0xFF1A1D2D) : const Color(0xFFF9FAFB);

Color _inputBorder(DesignColors c) =>
    themeController.isDark ? const Color(0xFF374151) : const Color(0xFFE5E7EB);

Color _labelColor(DesignColors c) =>
    themeController.isDark ? const Color(0xFF9CA3AF) : const Color(0xFF6B7280);

class _StepCard extends StatelessWidget {
  const _StepCard({required this.title, required this.icon, required this.child});

  final String title;
  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _cardColor(c),
        borderRadius: BorderRadius.circular(16),
        boxShadow: themeController.isDark
            ? null
            : [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 22, color: const Color(0xFF51FAAA)),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 19,
                  fontWeight: FontWeight.w700,
                  color: themeController.isDark
                      ? Colors.white
                      : const Color(0xFF111827),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          fontFamily: 'Outfit',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: _labelColor(c),
        ),
      ),
    );
  }
}

class _BrandTextField extends StatelessWidget {
  const _BrandTextField({
    required this.controller,
    this.hint,
    this.keyboard,
    this.maxLines = 1,
    this.prefixIcon,
    this.error,
    this.onChanged,
    this.readOnly = false,
  });

  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboard;
  final int maxLines;
  final IconData? prefixIcon;
  final String? error;
  final ValueChanged<String>? onChanged;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          keyboardType: keyboard,
          maxLines: maxLines,
          readOnly: readOnly,
          onChanged: onChanged,
          style: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: themeController.isDark
                ? Colors.white
                : const Color(0xFF111827),
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              fontFamily: 'Outfit',
              color: themeController.isDark
                  ? const Color(0xFF4B5563)
                  : const Color(0xFF9CA3AF),
            ),
            prefixIcon: prefixIcon == null
                ? null
                : Icon(prefixIcon, size: 18, color: const Color(0xFF9CA3AF)),
            filled: true,
            fillColor: _inputFill(c),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: _inputBorder(c)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: _inputBorder(c)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFF51FAAA), width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: kDesignDark.error, width: 1),
            ),
            errorText: error,
            errorStyle: const TextStyle(fontSize: 11, color: Color(0xFFEF4444)),
          ),
        ),
      ],
    );
  }
}

/// The web's `_FooterButton` — Back is a flat gray pill, Next/Submit is the
/// emerald→gold gradient with a glow.
class _FooterButton extends StatelessWidget {
  const _FooterButton({
    required this.label,
    required this.icon,
    required this.onPressed,
    this.gradient,
    this.loading = false,
  });

  final String label;
  final IconData? icon;
  final LinearGradient? gradient;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final enabled = onPressed != null && !loading;
    final bg = gradient ??
        (themeController.isDark
            ? const LinearGradient(
                colors: [Color(0xFF1F2937), Color(0xFF1F2937)])
            : const LinearGradient(
                colors: [Color(0xFFE5E7EB), Color(0xFFE5E7EB)]));
    final fg = gradient == null
        ? (themeController.isDark ? Colors.white : const Color(0xFF111827))
        : const Color(0xFF0A0C19);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: enabled ? onPressed : null,
        child: Ink(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            gradient: bg,
            borderRadius: BorderRadius.circular(12),
            boxShadow: gradient == null
                ? null
                : [
                    BoxShadow(
                      color: const Color(0xFF51FAAA).withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
          ),
          child: Opacity(
            opacity: enabled ? 1 : 0.6,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (loading)
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Color(0xFF0A0C19)),
                  )
                else if (icon != null) ...[
                  Icon(icon, size: 20, color: fg),
                  const SizedBox(width: 6),
                ],
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: fg,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ===========================================================================
// Step 1 — Basics (StepBasics.jsx)
// ===========================================================================

class _StepBasics extends StatelessWidget {
  const _StepBasics({
    required this.form,
    required this.errors,
    required this.c,
    required this.set,
  });

  final _AddPropertyForm form;
  final Map<String, String> errors;
  final DesignColors c;
  final void Function(void Function()) set;

  static const _types = [
    ('house', 'House', Icons.home_outlined),
    ('apartment', 'Apartment', Icons.apartment),
    ('commercial', 'Commercial', Icons.storefront_outlined),
    ('land', 'Land', Icons.landscape_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return _StepCard(
      title: 'Basic Details',
      icon: Icons.home_work_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FieldLabel('Property Title *'),
          _BrandTextField(
            controller: TextEditingController(text: form.title),
            hint: 'e.g. Modern Apartment in Kileleshwa',
            error: errors['title'],
            onChanged: (v) => set(() => form.title = v),
          ),
          const SizedBox(height: 20),
          _FieldLabel('Property Type *'),
          _TypeGrid(
            selected: form.propertyType,
            onSelect: (v) => set(() => form.propertyType = v),
          ),
          if (errors['propertyType'] != null)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                errors['propertyType']!,
                style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444)),
              ),
            ),
          // Multi-unit toggle (apartments / commercial only)
          if (form.propertyType == 'apartment' ||
              form.propertyType == 'commercial') ...[
            const SizedBox(height: 20),
            _MultiUnitToggle(
              enabled: form.hasMultipleUnits,
              onChanged: (v) => set(() => form.hasMultipleUnits = v),
            ),
          ],
          const SizedBox(height: 20),
          _FieldLabel('Status *'),
          _StatusToggle(
            status: form.status,
            onChanged: (v) => set(() => form.status = v),
          ),
          if (!form.hasMultipleUnits) ...[
            const SizedBox(height: 20),
            _FieldLabel('Price (KES) *'),
            _BrandTextField(
              controller: TextEditingController(text: form.price),
              hint: '0.00',
              keyboard: TextInputType.number,
              prefixIcon: Icons.attach_money,
              error: errors['price'],
              onChanged: (v) => set(() => form.price = v),
            ),
          ],
          const SizedBox(height: 20),
          _FieldLabel('Description *'),
          _BrandTextField(
            controller: TextEditingController(text: form.description),
            hint: 'Describe the key features, neighborhood, and selling points...',
            maxLines: 6,
            error: errors['description'],
            onChanged: (v) => set(() => form.description = v),
          ),
        ],
      ),
    );
  }
}

class _TypeGrid extends StatelessWidget {
  const _TypeGrid({required this.selected, required this.onSelect});

  final String selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        for (final (value, label, icon) in _StepBasics._types)
          GestureDetector(
            onTap: () => onSelect(value),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: (MediaQuery.of(context).size.width - 32 - 40 - 12) / 2,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                color: selected == value
                    ? const Color(0xFF51FAAA).withValues(alpha: 0.1)
                    : _inputFill(c),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  width: 2,
                  color: selected == value
                      ? const Color(0xFF51FAAA)
                      : _inputBorder(c),
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    icon,
                    size: 28,
                    color: selected == value
                        ? const Color(0xFF51FAAA)
                        : const Color(0xFF9CA3AF),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: selected == value
                          ? const Color(0xFF51FAAA)
                          : (themeController.isDark
                              ? const Color(0xFFD1D5DB)
                              : const Color(0xFF4B5563)),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _MultiUnitToggle extends StatelessWidget {
  const _MultiUnitToggle({required this.enabled, required this.onChanged});

  final bool enabled;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: enabled
            ? const Color(0xFF51FAAA).withValues(alpha: 0.1)
            : _inputFill(c),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: enabled
              ? const Color(0xFF51FAAA).withValues(alpha: 0.3)
              : _inputBorder(c),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.layers_outlined,
            size: 20,
            color: enabled ? const Color(0xFF51FAAA) : const Color(0xFF9CA3AF),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Multiple Unit Types?',
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: themeController.isDark
                        ? Colors.white
                        : const Color(0xFF111827),
                  ),
                ),
                Text(
                  'e.g. 1 Bedroom, 2 Bedroom, Studio',
                  style: const TextStyle(
                      fontSize: 12, color: Color(0xFF6B7280)),
                ),
              ],
            ),
          ),
          Switch(
            value: enabled,
            onChanged: onChanged,
            activeTrackColor: const Color(0xFF51FAAA),
            inactiveThumbColor:
                themeController.isDark ? Colors.white : Colors.white,
            inactiveTrackColor: themeController.isDark
                ? const Color(0xFF374151)
                : const Color(0xFFE5E7EB),
          ),
        ],
      ),
    );
  }
}

class _StatusToggle extends StatelessWidget {
  const _StatusToggle({required this.status, required this.onChanged});

  final String status;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Row(
      children: [
        for (final s in ['for-sale', 'for-rent'])
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                  right: s == 'for-sale' ? 12 : 0),
              child: GestureDetector(
                onTap: () => onChanged(s),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: status == s
                        ? const Color(0xFF51FAAA)
                        : _inputFill(c),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      width: 2,
                      color: status == s
                          ? const Color(0xFF51FAAA)
                          : _inputBorder(c),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      s.replaceAll('-', ' ').toUpperCase(),
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: status == s
                            ? const Color(0xFF0A0C19)
                            : (themeController.isDark
                                ? const Color(0xFF9CA3AF)
                                : const Color(0xFF6B7280)),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

// ===========================================================================
// Step 2 — Location (StepLocation.jsx)
// ===========================================================================

class _StepLocation extends StatelessWidget {
  const _StepLocation({
    required this.form,
    required this.errors,
    required this.c,
    required this.set,
    required this.onMapsLinkChange,
    required this.onGeocode,
    required this.geocoding,
    required this.resolvingUrl,
  });

  final _AddPropertyForm form;
  final Map<String, String> errors;
  final DesignColors c;
  final void Function(void Function()) set;
  final ValueChanged<String> onMapsLinkChange;
  final VoidCallback onGeocode;
  final bool geocoding;
  final bool resolvingUrl;

  @override
  Widget build(BuildContext context) {
    final hasCoords = form.lat.isNotEmpty && form.lng.isNotEmpty;
    return _StepCard(
      title: 'Location',
      icon: Icons.location_on_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FieldLabel('Address / Street *'),
          _BrandTextField(
            controller: TextEditingController(text: form.address),
            hint: 'e.g. 123 Argwings Kodhek Rd',
            error: errors['address'],
            onChanged: (v) => set(() => form.address = v),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _FieldLabel('City *'),
                    _BrandTextField(
                      controller: TextEditingController(text: form.city),
                      hint: 'e.g. Nairobi',
                      error: errors['city'],
                      onChanged: (v) => set(() => form.city = v),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _FieldLabel('State / County'),
                    _BrandTextField(
                      controller: TextEditingController(text: form.state),
                      hint: 'e.g. Nairobi',
                      onChanged: (v) => set(() => form.state = v),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Google Maps Link box (emerald tinted, like the web)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: themeController.isDark
                  ? const Color(0xFF10B981).withValues(alpha: 0.1)
                  : const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: themeController.isDark
                    ? const Color(0xFF065F46)
                    : const Color(0xFFA7F3D0),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.navigation_outlined,
                        size: 14, color: Color(0xFF10B981)),
                    SizedBox(width: 6),
                    Text(
                      'Google Maps Link or Code',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: TextEditingController(text: form.googleMapsLink),
                  onChanged: onMapsLinkChange,
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 13,
                    color: themeController.isDark
                        ? Colors.white
                        : const Color(0xFF111827),
                  ),
                  decoration: InputDecoration(
                    hintText: 'Paste Link or Code (e.g. V2V7+5JJ, Juja)',
                    hintStyle: const TextStyle(fontSize: 12),
                    prefixIcon: const Icon(Icons.search,
                        size: 16, color: Color(0xFF9CA3AF)),
                    filled: true,
                    fillColor: themeController.isDark
                        ? const Color(0xFF0A0C19)
                        : Colors.white,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: _inputBorder(c)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: _inputBorder(c)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide:
                          const BorderSide(color: Color(0xFF10B981)),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    if (resolvingUrl)
                      const Row(children: [
                        SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                              strokeWidth: 1.5, color: Color(0xFF10B981)),
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Resolving location...',
                          style: TextStyle(
                              fontSize: 11, color: Color(0xFF10B981)),
                        ),
                      ])
                    else if (hasCoords)
                      const Text(
                        '✓ Coordinates found',
                        style: TextStyle(
                            fontSize: 11, color: Color(0xFF22C55E)),
                      )
                    else
                      Text(
                        'Geocodes coordinates from link',
                        style: TextStyle(
                            fontSize: 11, color: _labelColor(c)),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Read-only coordinates
          Row(
            children: [
              Expanded(
                child: _BrandTextField(
                  controller: TextEditingController(text: form.lat),
                  hint: 'Latitude',
                  keyboard: TextInputType.number,
                  readOnly: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _BrandTextField(
                  controller: TextEditingController(text: form.lng),
                  hint: 'Longitude',
                  keyboard: TextInputType.number,
                  readOnly: true,
                ),
              ),
            ],
          ),
          if (errors['coordinates'] != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.error_outline,
                    size: 12, color: Color(0xFFEF4444)),
                const SizedBox(width: 4),
                Text(
                  errors['coordinates']!,
                  style: const TextStyle(
                      fontSize: 11, color: Color(0xFFEF4444)),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          // Geocode button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: geocoding || form.address.isEmpty ? null : onGeocode,
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF51FAAA),
                side: BorderSide(
                  color: themeController.isDark
                      ? const Color(0xFF51FAAA).withValues(alpha: 0.3)
                      : const Color(0xFF51FAAA),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                textStyle: const TextStyle(
                    fontFamily: 'Outfit',
                    fontWeight: FontWeight.w700,
                    fontSize: 13),
              ),
              child: Text(geocoding ? 'Locating...' : 'Geocode Address'),
            ),
          ),
          const SizedBox(height: 16),
          // Map preview with draggable pin
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              height: 220,
              width: double.infinity,
              child: hasCoords
                  ? _CoordMap(
                      lat: form.lat,
                      lng: form.lng,
                      onMoved: (p) => set(() {
                        form.lat = p.latitude.toString();
                        form.lng = p.longitude.toString();
                      }),
                    )
                  : Container(
                      color: _inputFill(c),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.map_outlined,
                              size: 30, color: _labelColor(c)),
                          const SizedBox(height: 8),
                          Text(
                            'Map will appear here when location is found',
                            style: TextStyle(
                                fontSize: 12, color: _labelColor(c)),
                          ),
                        ],
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Lightweight map preview — the web's draggable Google Maps pin, ported.
class _CoordMap extends StatefulWidget {
  const _CoordMap({
    required this.lat,
    required this.lng,
    required this.onMoved,
  });

  final String lat;
  final String lng;
  final ValueChanged<LatLng> onMoved;

  @override
  State<_CoordMap> createState() => _CoordMapState();
}

class _CoordMapState extends State<_CoordMap> {
  late LatLng _pos = LatLng(double.parse(widget.lat), double.parse(widget.lng));

  @override
  void didUpdateWidget(covariant _CoordMap old) {
    super.didUpdateWidget(old);
    final p = LatLng(double.parse(widget.lat), double.parse(widget.lng));
    if (p != _pos) _pos = p;
  }

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(target: _pos, zoom: 15),
      markers: {
        Marker(
          markerId: const MarkerId('location-pin'),
          position: _pos,
          draggable: true,
          onDragEnd: widget.onMoved,
        ),
      },
      onMapCreated: (controller) => controller
          .animateCamera(CameraUpdate.newLatLngZoom(_pos, 15)),
      myLocationButtonEnabled: false,
    );
  }
}

// ===========================================================================
// Step 3 — Details (StepDetails.jsx)
// ===========================================================================

class _StepDetails extends StatelessWidget {
  const _StepDetails({required this.form, required this.c, required this.set});

  final _AddPropertyForm form;
  final DesignColors c;
  final void Function(void Function()) set;

  @override
  Widget build(BuildContext context) {
    // Multi-unit mode
    if (form.hasMultipleUnits) {
      return _UnitConfigs(form: form, c: c, set: set);
    }
    return _StepCard(
      title: 'Property Details',
      icon: Icons.description_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _DetailsField(
            label: 'Bedrooms',
            icon: Icons.bed_outlined,
            controller: TextEditingController(text: form.bedrooms),
            onChanged: (v) => set(() => form.bedrooms = v),
          ),
          const SizedBox(height: 16),
          _DetailsField(
            label: 'Bathrooms',
            icon: Icons.bathtub_outlined,
            controller: TextEditingController(text: form.bathrooms),
            onChanged: (v) => set(() => form.bathrooms = v),
          ),
          const SizedBox(height: 16),
          _DetailsField(
            label: 'Area (sq ft)',
            icon: Icons.square_foot_outlined,
            controller: TextEditingController(text: form.area),
            onChanged: (v) => set(() => form.area = v),
          ),
          const SizedBox(height: 16),
          _DetailsField(
            label: 'Parking Spots',
            icon: Icons.local_parking_outlined,
            controller: TextEditingController(text: form.parking),
            onChanged: (v) => set(() => form.parking = v),
          ),
        ],
      ),
    );
  }
}

class _DetailsField extends StatelessWidget {
  const _DetailsField({
    required this.label,
    required this.icon,
    required this.controller,
    required this.onChanged,
  });

  final String label;
  final IconData icon;
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Row(
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: _labelColor(c),
            ),
          ),
        ),
        Expanded(
          child: TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            onChanged: onChanged,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: themeController.isDark
                  ? Colors.white
                  : const Color(0xFF111827),
            ),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, size: 16, color: const Color(0xFF9CA3AF)),
              filled: true,
              fillColor: _inputFill(c),
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: _inputBorder(c)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: _inputBorder(c)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                    const BorderSide(color: Color(0xFF51FAAA), width: 1.5),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Multi-unit configuration editor — unit presets + add form, ported from
/// StepDetails.jsx's multi-unit mode.
class _UnitConfigs extends StatefulWidget {
  const _UnitConfigs({required this.form, required this.c, required this.set});

  final _AddPropertyForm form;
  final DesignColors c;
  final void Function(void Function()) set;

  @override
  State<_UnitConfigs> createState() => _UnitConfigsState();
}

class _UnitConfigsState extends State<_UnitConfigs> {
  bool _showAdd = false;

  // New-unit draft
  String _type = '';
  String _name = '';
  String _price = '';
  String _beds = '';
  String _baths = '';
  String _area = '';
  String _available = '1';
  String _features = '';

  static const _presets = [
    ('bedsitter', 'Bedsitter', 0, 1),
    ('studio', 'Studio', 0, 1),
    ('1-bedroom', '1 Bedroom', 1, 1),
    ('2-bedroom', '2 Bedroom', 2, 2),
    ('3-bedroom', '3 Bedroom', 3, 2),
    ('3-bedroom-dsq', '3 Bed + DSQ', 3, 3),
    ('4-bedroom', '4 Bedroom', 4, 3),
    ('penthouse', 'Penthouse', 4, 4),
  ];

  void _selectPreset((String, String, int, int) p) {
    setState(() {
      _type = p.$1;
      _name = p.$2;
      _beds = p.$3.toString();
      _baths = p.$4.toString();
    });
  }

  void _addUnit() {
    if (_name.isEmpty || _price.isEmpty) return;
    widget.set(() {
      widget.form.units.add(_Unit(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: _name,
        price: num.tryParse(_price) ?? 0,
        bedrooms: int.tryParse(_beds) ?? 0,
        bathrooms: int.tryParse(_baths) ?? 0,
        area: int.tryParse(_area) ?? 0,
        unitsAvailable: int.tryParse(_available) ?? 1,
        features: _features,
      ));
    });
    setState(() {
      _type = '';
      _name = '';
      _price = '';
      _beds = '';
      _baths = '';
      _area = '';
      _available = '1';
      _features = '';
      _showAdd = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.c;
    return _StepCard(
      title: 'Unit Configurations',
      icon: Icons.layers_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row with Add Unit button
          SizedBox(
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                GestureDetector(
                  onTap: () => setState(() => _showAdd = true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF51FAAA).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.add, size: 14, color: Color(0xFF51FAAA)),
                        SizedBox(width: 4),
                        Text(
                          'Add Unit',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF51FAAA),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          // Added units list
          if (widget.form.units.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    width: 2,
                    color: themeController.isDark
                        ? const Color(0xFF1F2937)
                        : const Color(0xFFE5E7EB)),
              ),
              child: Column(
                children: [
                  Text(
                    'No units added yet.',
                    style: TextStyle(
                      fontSize: 13,
                      color: _labelColor(c),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Add unit types like "Studio", "1 Bedroom", etc.',
                    style: TextStyle(
                        fontSize: 11,
                        color: themeController.isDark
                            ? const Color(0xFF4B5563)
                            : const Color(0xFF9CA3AF)),
                  ),
                ],
              ),
            )
          else
            for (final unit in widget.form.units)
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _inputFill(c),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _inputBorder(c)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            unit.name,
                            style: TextStyle(
                              fontFamily: 'Outfit',
                              fontWeight: FontWeight.w700,
                              color: themeController.isDark
                                  ? Colors.white
                                  : const Color(0xFF111827),
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline,
                              size: 16, color: Color(0xFFEF4444)),
                          onPressed: () => widget.set(
                              () => widget.form.units.removeWhere(
                                  (u) => u.id == unit.id)),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'KES ${_formatNum(unit.price)}',
                            style: const TextStyle(
                              fontFamily: 'Outfit',
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: Color(0xFF51FAAA),
                            ),
                          ),
                        ),
                        Text(
                          '${unit.unitsAvailable} Available',
                          style: TextStyle(
                            fontSize: 10,
                            color: _labelColor(c),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _miniStat('${unit.bedrooms} beds', c),
                        _miniStat('${unit.bathrooms} baths', c),
                        _miniStat('${unit.area} ft²', c),
                      ],
                    ),
                  ],
                ),
              ),
          // Add-unit form
          if (_showAdd) ...[
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _cardColor(c),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _inputBorder(c)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'New Configuration',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: themeController.isDark
                                ? Colors.white
                                : const Color(0xFF111827),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.close,
                            size: 16, color: _labelColor(c)),
                        onPressed: () => setState(() => _showAdd = false),
                      ),
                    ],
                  ),
                  // Preset chips (horizontal scroll)
                  SizedBox(
                    height: 38,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        for (final p in _presets)
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () => _selectPreset(p),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: _type == p.$1
                                      ? const Color(0xFF51FAAA)
                                      : (themeController.isDark
                                          ? const Color(0xFF1F2937)
                                          : const Color(0xFFF3F4F6)),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text(
                                    p.$2,
                                    style: TextStyle(
                                      fontFamily: 'Outfit',
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: _type == p.$1
                                          ? const Color(0xFF0A0C19)
                                          : (themeController.isDark
                                              ? const Color(0xFFD1D5DB)
                                              : const Color(0xFF4B5563)),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  _miniField('Unit Name', _name,
                      (v) => setState(() => _name = v),
                      hint: 'e.g. 2 Bedroom Apartment'),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _miniField('Price (KES)', _price,
                            (v) => setState(() => _price = v),
                            numeric: true, hint: '0.00'),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _miniField('Units Available', _available,
                            (v) => setState(() => _available = v),
                            numeric: true),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                          child: _miniField('Beds', _beds,
                              (v) => setState(() => _beds = v),
                              numeric: true)),
                      const SizedBox(width: 10),
                      Expanded(
                          child: _miniField('Baths', _baths,
                              (v) => setState(() => _baths = v),
                              numeric: true)),
                      const SizedBox(width: 10),
                      Expanded(
                          child: _miniField('Sq Ft', _area,
                              (v) => setState(() => _area = v),
                              numeric: true)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _miniField(
                      'Key Features (Optional)', _features,
                      (v) => setState(() => _features = v),
                      hint: 'e.g. Ensuite, Balcony, Open Kitchen'),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: _addUnit,
                        child: Ink(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF51FAAA),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.add,
                                  size: 16, color: Color(0xFF0A0C19)),
                              SizedBox(width: 6),
                              Text(
                                'Add Configuration',
                                style: TextStyle(
                                  fontFamily: 'Outfit',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF0A0C19),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _miniStat(String label, DesignColors c) => Padding(
        padding: const EdgeInsets.only(right: 14),
        child: Text(
          label,
          style: TextStyle(fontSize: 11, color: _labelColor(c)),
        ),
      );

  Widget _miniField(
    String label,
    String value,
    ValueChanged<String> onChanged, {
    bool numeric = false,
    String? hint,
  }) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
            color: _labelColor(c),
          ),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: TextEditingController(text: value),
          keyboardType: numeric ? TextInputType.number : TextInputType.text,
          textAlign: numeric ? TextAlign.center : TextAlign.start,
          onChanged: onChanged,
          style: const TextStyle(fontFamily: 'Outfit', fontSize: 13),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(fontSize: 12, color: _labelColor(c)),
            filled: true,
            fillColor: themeController.isDark
                ? const Color(0xFF0A0C19)
                : const Color(0xFFF9FAFB),
            isDense: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: _inputBorder(c)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: _inputBorder(c)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: Color(0xFF51FAAA), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

String _formatNum(num n) {
  final s = n.toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return buf.toString();
}

// ===========================================================================
// Step 4 — Amenities (StepAmenities.jsx)
// ===========================================================================

class _StepAmenities extends StatelessWidget {
  const _StepAmenities({required this.form, required this.c, required this.set});

  final _AddPropertyForm form;
  final DesignColors c;
  final void Function(void Function()) set;

  static const _groups = [
    (
      '🛠 Utilities & Essentials',
      [
        ('reliable-water', 'Reliable Water Supply 💧'),
        ('backup-power', 'Backup Generator ⚡'),
        ('secure-compound', 'Secure Compound 🔒'),
        ('garbage-collection', 'Garbage Collection ♻️'),
        ('fibre-internet', 'Fibre Internet 🌐'),
        ('wifi', 'WiFi 📶'),
      ],
    ),
    (
      '🏢 Apartment Features',
      [
        ('ensuite-bedrooms', 'En-suite Bedrooms 🛏'),
        ('modern-kitchen', 'Modern Kitchen 🍳'),
        ('spacious-balcony', 'Spacious Balcony 🌿'),
        ('laundry-area', 'Laundry Area 🧺'),
        ('water-heater', 'Water Heater 🚿'),
        ('dsq', 'DSQ 👩‍🍳'),
        ('elevator', 'Lift/Elevator 🛗'),
        ('ample-parking', 'Ample Parking 🚗'),
      ],
    ),
    (
      '🌟 Comfort & Lifestyle',
      [
        ('gym', 'Gym 💪'),
        ('swimming-pool', 'Swimming Pool 🏊'),
        ('garden-lawns', 'Garden/Lawns 🌱'),
        ('clubhouse', 'Clubhouse 🏠'),
        ('play-area', 'Play Area 🛝'),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return _StepCard(
      title: 'Select Amenities',
      icon: Icons.check_circle_outline,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final (groupTitle, items) in _groups) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                groupTitle,
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: _labelColor(c),
                ),
              ),
            ),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final (value, label) in items)
                  _AmenityChip(
                    label: label,
                    selected: form.amenities.contains(value),
                    onTap: () => set(() {
                      if (form.amenities.contains(value)) {
                        form.amenities.remove(value);
                      } else {
                        form.amenities.add(value);
                      }
                    }),
                  ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ],
      ),
    );
  }
}

class _AmenityChip extends StatelessWidget {
  const _AmenityChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFF51FAAA)
              : _inputFill(c),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? const Color(0xFF51FAAA)
                : _inputBorder(c),
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: const Color(0xFF51FAAA).withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: selected
                ? const Color(0xFF0A0C19)
                : (themeController.isDark
                    ? const Color(0xFFD1D5DB)
                    : const Color(0xFF4B5563)),
          ),
        ),
      ),
    );
  }
}

// ===========================================================================
// Step 5 — Media (StepMedia.jsx)
// ===========================================================================

class _StepMedia extends StatelessWidget {
  const _StepMedia({
    required this.files,
    required this.c,
    required this.onPick,
    required this.onRemove,
  });

  final List<XFile> files;
  final DesignColors c;
  final VoidCallback onPick;
  final ValueChanged<int> onRemove;

  @override
  Widget build(BuildContext context) {
    return _StepCard(
      title: 'Property Images',
      icon: Icons.photo_camera_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Add distinct photos of your property. High quality images increase engagement.',
            style: TextStyle(fontSize: 13, color: _labelColor(c)),
          ),
          const SizedBox(height: 16),
          // Upload tile
          GestureDetector(
            onTap: onPick,
            child: Container(
              width: double.infinity,
              height: 180,
              decoration: BoxDecoration(
                color: _inputFill(c),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  width: 2,
                  color: themeController.isDark
                      ? const Color(0xFF374151)
                      : const Color(0xFFD1D5DB),
                  style: BorderStyle.solid,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFF51FAAA).withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add,
                        size: 28, color: Color(0xFF51FAAA)),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Tap to Upload',
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: themeController.isDark
                          ? Colors.white
                          : const Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Max 10 images, 5MB each',
                    style: TextStyle(fontSize: 12, color: _labelColor(c)),
                  ),
                ],
              ),
            ),
          ),
          if (files.isNotEmpty) ...[
            const SizedBox(height: 16),
            // Grid (3 columns, like the web)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: files.length,
              itemBuilder: (context, i) => Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(
                      File(files[i].path),
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: _inputFill(c),
                        child: Icon(Icons.broken_image_outlined,
                            color: _labelColor(c)),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: GestureDetector(
                      onTap: () => onRemove(i),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xE6EF4444),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close,
                            size: 12, color: Colors.white),
                      ),
                    ),
                  ),
                  if (i == 0)
                    Positioned(
                      left: 6,
                      bottom: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF51FAAA),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Cover',
                          style: TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF0A0C19),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ] else ...[
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  Icon(Icons.image_outlined,
                      size: 40, color: _labelColor(c).withValues(alpha: 0.6)),
                  const SizedBox(height: 8),
                  Text(
                    'No images selected yet',
                    style: TextStyle(fontSize: 13, color: _labelColor(c)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ===========================================================================
// Step 6 — Review (StepReview.jsx)
// ===========================================================================

class _StepReview extends StatelessWidget {
  const _StepReview({required this.form, required this.c});

  final _AddPropertyForm form;
  final DesignColors c;

  @override
  Widget build(BuildContext context) {
    return _StepCard(
      title: 'Review Details',
      icon: Icons.check_circle_outline,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image strip
          if (form.imageFiles.isNotEmpty)
            SizedBox(
              height: 72,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  for (final f in form.imageFiles)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          File(f.path),
                          width: 72,
                          height: 72,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 72,
                            height: 72,
                            color: _inputFill(c),
                            child: Icon(Icons.image_outlined,
                                color: _labelColor(c)),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            )
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    style: BorderStyle.solid,
                    color: _inputBorder(c),
                    width: 1),
              ),
              child: Center(
                child: Text(
                  'No images added',
                  style: TextStyle(fontSize: 12, color: _labelColor(c)),
                ),
              ),
            ),
          const SizedBox(height: 16),
          _ReviewSection(
            title: 'Property Info',
            rows: [
              ('Title', form.title),
              ('Type', form.propertyType),
              ('Price',
                  'KES ${_formatNum(int.tryParse(form.price) ?? 0)}'),
              ('Location', '${form.city}, ${form.address}'),
            ],
          ),
          const SizedBox(height: 12),
          if (form.hasMultipleUnits && form.units.isNotEmpty)
            _ReviewSection(
              title: 'Unit Configurations',
              rows: [
                for (final u in form.units)
                  (u.name, '${u.bedrooms}b/${u.bathrooms}b'),
              ],
            )
          else
            _ReviewSection(
              title: 'Details',
              rows: [
                ('Bedrooms', form.bedrooms.isEmpty ? '-' : form.bedrooms),
                ('Bathrooms', form.bathrooms.isEmpty ? '-' : form.bathrooms),
                ('Area', form.area.isEmpty ? '-' : '${form.area} sqft'),
                ('Parking', form.parking.isEmpty ? '-' : form.parking),
              ],
            ),
          const SizedBox(height: 12),
          _ReviewSection(
            title: 'Contact',
            rows: [
              ('Name', form.contactName),
              ('Phone', form.contactPhone.isEmpty ? '-' : form.contactPhone),
            ],
          ),
        ],
      ),
    );
  }
}

class _ReviewSection extends StatelessWidget {
  const _ReviewSection({required this.title, required this.rows});

  final String title;
  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _inputFill(c),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title.toUpperCase(),
            style: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: Color(0xFF51FAAA),
            ),
          ),
          const SizedBox(height: 8),
          for (final (label, value) in rows)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 13,
                        color: _labelColor(c),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      value,
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: themeController.isDark
                            ? Colors.white
                            : const Color(0xFF111827),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
