import 'package:flutter/material.dart';

import '../../config/member_config.dart';
import '../../theme/nia_tokens.dart';
import '../../widgets/common.dart';
import '../shell/member_shell.dart';
import 'session_source.dart';

/// Phone sign-in — the front of the chain: Phone → Session issued → the app.
///
/// The Member enters his phone; this device is bound; `POST /v1/sessions` issues
/// an opaque token (spec 0002, phone-first re-proof, FD-S1) which then carries
/// the whole experience (Home, Wallet, Membership, Family). Default-deny: an
/// unrecognised number is not let in — the number alone is never enough (security
/// boundary 2), so the way through is your Operator.
///
/// Verification strength (a one-time code) is a later, spec-gated step; here the
/// phone is the proof. This screen is the Developer Preview entry; the offline
/// prototype (`main.dart`) does not use it.
class PhoneSignInPage extends StatefulWidget {
  const PhoneSignInPage({
    super.key,
    required this.baseUrl,
    this.defaultPhone = '',
    this.sessionSource,
    this.onSession,
  });

  /// The preview backend host (no `/v1`); passed to the app once signed in.
  final String baseUrl;

  /// Prefilled number so the demo journey runs out of the box.
  final String defaultPhone;

  /// Issues the session. Defaults to [ApiSessionSource] over [baseUrl]; injected
  /// in tests.
  final SessionSource? sessionSource;

  /// Called with the issued token. Defaults to entering the [MemberShell] live.
  final void Function(String token)? onSession;

  @override
  State<PhoneSignInPage> createState() => _PhoneSignInPageState();
}

class _PhoneSignInPageState extends State<PhoneSignInPage> {
  late final TextEditingController _phone =
      TextEditingController(text: widget.defaultPhone);
  late final SessionSource _source =
      widget.sessionSource ?? ApiSessionSource(baseUrl: widget.baseUrl);
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  Future<void> _continue() async {
    final phone = _phone.text.trim();
    if (phone.isEmpty) {
      setState(() => _error = 'Enter your phone number.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final token = await _source.issue(phone: phone, deviceId: 'dev-preview-web');
      if (!mounted) return;
      (widget.onSession ?? _enter)(token);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _busy = false;
        _error = "We don't recognise that number. Your Operator can help you in person.";
      });
    }
  }

  void _enter(String token) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(
        builder: (_) => MemberShell(
          config: MemberConfig(apiBaseUrl: widget.baseUrl, memberToken: token),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
              NiaTokens.s5, NiaTokens.s8, NiaTokens.s5, NiaTokens.s8),
          children: <Widget>[
            const SizedBox(height: NiaTokens.s7),
            Text('Nia', style: theme.textTheme.headlineLarge),
            const SizedBox(height: NiaTokens.s7),
            Text('This phone becomes your Nia phone.',
                style: theme.textTheme.headlineMedium?.copyWith(height: 1.2)),
            const SizedBox(height: NiaTokens.s3),
            Text(
              'Enter your number to continue. Only this phone will sign in as you.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: NiaTokens.s7),
            TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              enabled: !_busy,
              decoration: const InputDecoration(
                labelText: 'Phone',
                hintText: '+91…',
                border: OutlineInputBorder(),
              ),
              onSubmitted: (_) => _busy ? null : _continue(),
            ),
            if (_error != null) ...<Widget>[
              const SizedBox(height: NiaTokens.s4),
              Text(_error!,
                  style: theme.textTheme.bodyMedium?.copyWith(color: NiaTokens.red)),
              const SizedBox(height: NiaTokens.s2),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => openOperatorSheet(context),
                  icon: const Icon(Icons.headset_mic_outlined, size: 18),
                  label: const Text('Talk to your Operator'),
                ),
              ),
            ],
            const SizedBox(height: NiaTokens.s7),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: NiaTokens.ink,
                  padding: const EdgeInsets.symmetric(vertical: NiaTokens.s4),
                ),
                onPressed: _busy ? null : _continue,
                child: _busy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: NiaTokens.ground),
                      )
                    : const Text('Continue'),
              ),
            ),
            const SizedBox(height: NiaTokens.s4),
            Text(
              'A real one-time code comes with the phone-verification slice; for now '
              'your number is the proof.',
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
