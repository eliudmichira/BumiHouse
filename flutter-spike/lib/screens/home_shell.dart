import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../theme.dart';
import '../widgets/brand_bottom_nav.dart';
import '../widgets/brand_toggle.dart';
import 'add_property_screen.dart';
import 'map_screen.dart';
import 'property_list_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _tab = 0;

  void _comingSoon(String what) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text('$what is coming soon')));
  }

  void _showProfile() {
    final c = themeController.isDark ? kDesignDark : kDesignLight;
    final user = FirebaseAuth.instance.currentUser;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: c.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
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
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF51FAAA), Color(0xFFDBD5A4)],
                    ),
                  ),
                  child: const Icon(Icons.person, color: Color(0xFF0A0C19)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Signed in',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: c.textMuted,
                        ),
                      ),
                      Text(
                        user?.email ?? 'Guest user',
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: c.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  FirebaseAuth.instance.signOut();
                },
                icon: const Icon(Icons.logout, size: 18),
                label: const Text('Sign out'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: c.error,
                  side: BorderSide(color: c.error.withValues(alpha: 0.5)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onSelect(int i) {
    if (i == 2) {
      _comingSoon('Favorites');
      return;
    }
    if (i == 3) {
      _showProfile();
      return;
    }
    setState(() => _tab = i);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.home_work, color: Color(0xFF51FAAA)),
            SizedBox(width: 8),
            Text('BumiHouse'),
          ],
        ),
        actions: [
          // The brand sun/moon toggle from the auth pages — now app-wide.
          SizedBox(
            width: 36,
            height: 36,
            child: BrandSunMoonToggle(
              isDark: themeController.isDark,
              bg: themeController.isDark
                  ? DesignColors.dark.scaffold
                  : DesignColors.light.scaffold,
              onTap: themeController.toggle,
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _tab,
        children: const [
          PropertyListScreen(),
          MapScreen(),
        ],
      ),
      bottomNavigationBar: BrandBottomNav(
        left: const [
          BrandNavDestination(
            label: 'Home',
            icon: Icons.home_outlined,
            selectedIcon: Icons.home,
          ),
          BrandNavDestination(
            label: 'Map',
            icon: Icons.map_outlined,
            selectedIcon: Icons.map,
          ),
        ],
        right: const [
          BrandNavDestination(
            label: 'Favorites',
            icon: Icons.favorite_border,
            selectedIcon: Icons.favorite,
          ),
          BrandNavDestination(
            label: 'Profile',
            icon: Icons.person_outline,
            selectedIcon: Icons.person,
          ),
        ],
        selectedIndex: _tab,
        onSelect: _onSelect,
        onAddProperty: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => const AddPropertyScreen(),
          ),
        ),
      ),
    );
  }
}
