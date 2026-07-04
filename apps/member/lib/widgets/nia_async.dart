import 'package:flutter/material.dart';

import '../theme/nia_tokens.dart';

/// A live-surface async view: loading → data, and — critically — a calm,
/// **recoverable error state** instead of an endless spinner when a fetch fails
/// (airplane mode, a dropped network, a 4xx/5xx, a timeout, or the source's own
/// error). Used only on the live/preview surfaces; the frozen board screens
/// render synchronously and never reach this.
///
/// The error state follows Book III: no alarm colour, no blame — a plain, calm
/// line and a "Try again" affordance. Retry re-issues [load] (that is why it is a
/// factory, not a pre-built `Future`).
class NiaAsyncView<T> extends StatefulWidget {
  const NiaAsyncView({
    super.key,
    required this.load,
    required this.builder,
    this.loading,
    this.errorMessage = 'We couldn’t reach Nia just now.',
  });

  /// Starts — and, on retry, restarts — the fetch.
  final Future<T> Function() load;

  /// Renders the loaded value.
  final Widget Function(BuildContext context, T data) builder;

  /// Shown while loading. Defaults to a small, left-aligned indicator so each
  /// surface can keep its existing loading footprint by passing its own.
  final Widget? loading;

  /// Calm, reassuring copy for the error state (never alarm, never blame).
  final String errorMessage;

  @override
  State<NiaAsyncView<T>> createState() => _NiaAsyncViewState<T>();
}

class _NiaAsyncViewState<T> extends State<NiaAsyncView<T>> {
  late Future<T> _future = widget.load();

  void _retry() {
    setState(() {
      _future = widget.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _future,
      builder: (BuildContext context, AsyncSnapshot<T> snap) {
        if (snap.hasError) {
          return NiaAsyncError(message: widget.errorMessage, onRetry: _retry);
        }
        if (!snap.hasData) {
          return widget.loading ?? const NiaAsyncLoading();
        }
        return widget.builder(context, snap.data as T);
      },
    );
  }
}

/// The default calm loading indicator: small, left-aligned, quiet.
class NiaAsyncLoading extends StatelessWidget {
  const NiaAsyncLoading({super.key, this.height = 96, this.size = 24});

  final double height;
  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Align(
        alignment: Alignment.centerLeft,
        child: SizedBox(
          width: size,
          height: size,
          child: const CircularProgressIndicator(strokeWidth: 2),
        ),
      ),
    );
  }
}

/// The calm, recoverable error state — a plain line plus "Try again". No alarm
/// colour (Book III §2.1: colour carries state only, never decoration/alarm here).
class NiaAsyncError extends StatelessWidget {
  const NiaAsyncError({super.key, required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(message, style: theme.textTheme.bodyLarge),
        const SizedBox(height: NiaTokens.s2),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: NiaTokens.ink,
              padding: const EdgeInsets.symmetric(
                  horizontal: NiaTokens.s2, vertical: NiaTokens.s2),
            ),
            onPressed: onRetry,
            icon: const Icon(Icons.refresh, size: 18),
            label: const Text('Try again'),
          ),
        ),
      ],
    );
  }
}
