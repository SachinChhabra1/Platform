import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../theme/nia_tokens.dart';

/// Global crash recovery (R9). If a widget throws during build, Flutter's default
/// is a raw error box — alarming and useless to a Member. [installNiaCrashBoundary]
/// replaces it, in profile/release builds, with a calm [NiaErrorScreen] so the app
/// never shows a raw crash to a Member. In debug it stays out of the way so the
/// developer keeps Flutter's red diagnostic. Call once per entrypoint before
/// `runApp` (`main.dart`, `main_preview.dart`).
void installNiaCrashBoundary() {
  if (!kDebugMode) {
    ErrorWidget.builder = niaErrorWidgetBuilder;
  }
}

/// The boundary's builder, exposed for testing. Always returns the calm screen.
Widget niaErrorWidgetBuilder(FlutterErrorDetails details) => const NiaErrorScreen();

/// The calm fallback shown in place of a crashed widget subtree. Reassures (money
/// and record are safe) and offers the one reliable recovery on a prototype with
/// no live restart — reopen the app. No alarm colour (Book III).
class NiaErrorScreen extends StatelessWidget {
  const NiaErrorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // An ErrorWidget may be inserted anywhere — including above the Material /
    // Directionality ancestors — so it provides the minimum it needs itself.
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Container(
        color: NiaTokens.ground,
        alignment: Alignment.center,
        padding: const EdgeInsets.all(NiaTokens.s6),
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Something interrupted this screen.',
              style: TextStyle(
                color: NiaTokens.ink,
                fontSize: 22,
                fontWeight: FontWeight.w600,
                height: 1.2,
              ),
            ),
            SizedBox(height: NiaTokens.s3),
            Text(
              'Nia is still here — your money and your record are safe. '
              'Close the app and open it again.',
              style: TextStyle(
                color: NiaTokens.inkSecondary,
                fontSize: 15,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
