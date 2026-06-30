import 'package:flutter/material.dart';

import 'app.dart';
import 'config/member_config.dart';

/// Developer Preview entrypoint — launches the Member app straight into the
/// **live** experience, reading the real services through the composed preview
/// backend (`services/preview`, one origin for Wallet + Membership).
///
/// Run it (the `nia preview` launcher does this for you):
///   flutter run -t lib/main_preview.dart -d chrome \
///     --dart-define=NIA_API_BASE_URL=http://127.0.0.1:8080 \
///     --dart-define=NIA_MEMBER_TOKEN=sess-ramesh-001
///
/// The defaults below mean it "just works" with the launcher: an empty
/// `--dart-define` falls back to the local preview backend and the seeded demo
/// session. The offline Product Review Prototype is unchanged — that is still
/// `main.dart` (empty base URL ⇒ the Sample*Source default).
void main() {
  const String baseUrl = String.fromEnvironment(
    'NIA_API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8080',
  );
  const String token = String.fromEnvironment(
    'NIA_MEMBER_TOKEN',
    defaultValue: 'sess-ramesh-001',
  );
  runApp(const NiaMemberApp(
    config: MemberConfig(apiBaseUrl: baseUrl, memberToken: token),
  ));
}
