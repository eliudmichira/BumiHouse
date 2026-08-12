import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // On Android/iOS the Firebase config is auto-loaded from
  // google-services.json / GoogleService-Info.plist — no options needed here.
  await Firebase.initializeApp();
  await themeController.load(); // persisted light/dark, defaults to dark
  runApp(const BumiSpikeApp());
}

class BumiSpikeApp extends StatelessWidget {
  const BumiSpikeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: themeController,
      builder: (context, isDark, _) {
        final colors = isDark ? kDesignDark : kDesignLight;
        return MaterialApp(
          title: 'BumiHouse',
          debugShowCheckedModeBanner: false,
          theme: buildHomesKeTheme(colors),
          home: const AuthGate(),
        );
      },
    );
  }
}

/// Streams the Firebase auth state — shows the login screen until a user is
/// signed in, then swaps to the main shell (list + map).
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        return snapshot.data == null
            ? const AuthScreen()
            : const HomeShell();
      },
    );
  }
}
