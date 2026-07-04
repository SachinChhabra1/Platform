import 'package:flutter/material.dart';

import 'app.dart';
import 'features/auth/phone_sign_in_page.dart';
import 'widgets/nia_error_boundary.dart';

/// Developer Preview entrypoint — opens on the **whole journey**: Phone → Session
/// issued → the app (Home → Wallet → Membership → Family), all against the
/// composed preview backend (`services/preview`, one origin).
///
/// Run it (the `nia preview` launcher does this for you):
///   flutter run -t lib/main_preview.dart -d chrome \
///     --dart-define=NIA_API_BASE_URL=http://127.0.0.1:8080
///
/// The phone field is prefilled with the demo Member's number, so "Continue"
/// issues a real session and enters the app. Other demo numbers walk the paused
/// / closed standings (see `nia preview` output). The offline Product Review
/// Prototype is unchanged — that is still `main.dart`.
void main() {
  installNiaCrashBoundary();
  const String baseUrl = String.fromEnvironment(
    'NIA_API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8080',
  );
  const String defaultPhone = String.fromEnvironment(
    'NIA_DEMO_PHONE',
    defaultValue: '+919800000001',
  );
  runApp(NiaMemberApp(
    home: const PhoneSignInPage(baseUrl: baseUrl, defaultPhone: defaultPhone),
  ));
}
