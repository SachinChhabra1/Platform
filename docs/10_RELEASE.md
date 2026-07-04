# 10 · Release

How a build ships. **Today:** the Member app is web-only — `flutter build web --release -t lib/main.dart`
produces `apps/member/build/web/`; the board demo is served locally + a temporary tunnel (pack at
`~/Desktop/nia-board-demo/OPEN-ME.md`). Recovery snapshots: `nia bundle create` (verified). No native
iOS/Android build and no CI pipeline yet — see [`16_RISK_REGISTER.md`](16_RISK_REGISTER.md) K1/K2.
🕳 Fill this book out when a real release pipeline exists.
