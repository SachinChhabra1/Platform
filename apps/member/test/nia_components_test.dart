import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/pillars/nia_components.dart';
import 'package:member/theme/nia_tokens.dart';

/// Direct coverage for the shared component surface that all four pillars are
/// built on (`nia_components.dart`). These lock the contracts the hardened
/// screens rely on — card styling, row semantics/tap, the SummaryCard icon, and
/// the reveal motion settling — so a future refactor can't silently break them.

Future<void> _pump(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(
    MaterialApp(home: Scaffold(body: Center(child: child))),
  );
  await tester.pumpAndSettle();
}

BoxDecoration _rootDecoration(WidgetTester tester, Finder of) {
  final Container c = tester.widget<Container>(
    find.descendant(of: of, matching: find.byType(Container)).first,
  );
  return c.decoration! as BoxDecoration;
}

void main() {
  group('InfoCard', () {
    testWidgets('plain: white ground + hairline border', (WidgetTester t) async {
      await _pump(t, const InfoCard(child: Text('x')));
      final BoxDecoration d = _rootDecoration(t, find.byType(InfoCard));
      expect(d.color, NiaTokens.ground);
      expect((d.border! as Border).top.color, NiaTokens.hairline);
      expect(find.text('x'), findsOneWidget);
    });

    testWidgets('hero: 2px blue border', (WidgetTester t) async {
      await _pump(t, const InfoCard(style: CardStyle.hero, child: Text('x')));
      final Border b = _rootDecoration(t, find.byType(InfoCard)).border! as Border;
      expect(b.top.color, NiaTokens.blue);
      expect(b.top.width, 2);
    });

    testWidgets('grey: soft grey fill, no border', (WidgetTester t) async {
      await _pump(t, const InfoCard(style: CardStyle.grey, child: Text('x')));
      final BoxDecoration d = _rootDecoration(t, find.byType(InfoCard));
      expect(d.color, NiaTokens.surfaceGrey);
      expect(d.border, isNull);
    });
  });

  group('ListRow', () {
    testWidgets('renders title, subtitle, trailing, chevron', (WidgetTester t) async {
      await _pump(
        t,
        const ListRow(
          icon: Icons.work_outline,
          title: 'Machine Operator II',
          subtitle: 'After your certification',
          trailing: '+₹2,500/mo',
          showChevron: true,
        ),
      );
      expect(find.text('Machine Operator II'), findsOneWidget);
      expect(find.text('After your certification'), findsOneWidget);
      expect(find.text('+₹2,500/mo'), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
    });

    testWidgets('is a button with a merged semantics label and fires onTap',
        (WidgetTester t) async {
      final SemanticsHandle handle = t.ensureSemantics();
      int taps = 0;
      await _pump(
        t,
        ListRow(
          icon: Icons.bed_outlined,
          title: 'Your Nest',
          subtitle: 'Rest well.',
          onTap: () => taps++,
        ),
      );
      expect(find.bySemanticsLabel('Your Nest. Rest well.'), findsOneWidget);
      await t.tap(find.byType(ListRow));
      await t.pump();
      expect(taps, 1);
      handle.dispose();
    });

    testWidgets('no subtitle: label is just the title', (WidgetTester t) async {
      final SemanticsHandle handle = t.ensureSemantics();
      await _pump(
        t,
        const ListRow(icon: Icons.info_outline, title: 'Solo', subtitle: ''),
      );
      expect(find.bySemanticsLabel('Solo'), findsOneWidget);
      handle.dispose();
    });
  });

  group('SummaryCard', () {
    testWidgets('defaults to the trending-up flywheel glyph', (WidgetTester t) async {
      await _pump(t, const SummaryCard(title: 'Kept more', subtitle: 'sub'));
      expect(find.byIcon(Icons.trending_up), findsOneWidget);
      expect(find.text('Kept more'), findsOneWidget);
      expect(find.text('sub'), findsOneWidget);
    });

    testWidgets('honours a custom icon (Family closes on a heart)',
        (WidgetTester t) async {
      await _pump(
        t,
        const SummaryCard(
          icon: Icons.favorite,
          title: 'The people you left home for are doing better',
          subtitle: 'sub',
        ),
      );
      expect(find.byIcon(Icons.favorite), findsOneWidget);
      expect(find.byIcon(Icons.trending_up), findsNothing);
    });
  });

  group('SectionHeader', () {
    testWidgets('renders title and optional trailing', (WidgetTester t) async {
      await _pump(
        t,
        const SectionHeader('Better jobs waiting', trailing: Text('See all')),
      );
      expect(find.text('Better jobs waiting'), findsOneWidget);
      expect(find.text('See all'), findsOneWidget);
    });
  });

  group('OpportunityCard', () {
    testWidgets('names RafiQi as finder and shows gain + tag', (WidgetTester t) async {
      await _pump(
        t,
        const OpportunityCard(
          foundLabel: 'More you can keep',
          icon: Icons.local_laundry_service_outlined,
          title: "Laundry's included",
          subtitle: 'Log a Sunday shift instead',
          gain: '+₹800',
          tag: 'Work',
        ),
      );
      expect(find.textContaining('More you can keep · found by RafiQi'),
          findsOneWidget);
      expect(find.text('+₹800'), findsOneWidget);
      expect(find.text('Work'), findsOneWidget);
    });
  });

  group('MovementCheck (the ○→✓ motion)', () {
    Opacity opacityOf(WidgetTester t, IconData icon) => t.widget<Opacity>(
        find.ancestor(of: find.byIcon(icon), matching: find.byType(Opacity)).first);

    testWidgets('begins as waiting — ○ shown, ✓ hidden', (WidgetTester t) async {
      await t.pumpWidget(const MaterialApp(
          home: Scaffold(body: Center(child: MovementCheck(size: 16)))));
      await t.pump(); // first frame, animation at t≈0
      expect(opacityOf(t, Icons.radio_button_unchecked).opacity, greaterThan(0.5));
      expect(opacityOf(t, Icons.check_circle).opacity, lessThan(0.5));
      await t.pumpAndSettle();
    });

    testWidgets('settles on true — ✓ fully shown', (WidgetTester t) async {
      await _pump(t, const MovementCheck(size: 16)); // pumpAndSettle
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
      expect(opacityOf(t, Icons.check_circle).opacity, 1.0);
    });
  });

  group('NiaReveal', () {
    testWidgets('settles to fully visible (opacity 1) with the child shown',
        (WidgetTester t) async {
      await _pump(t, const NiaReveal(child: Text('revealed')));
      expect(find.text('revealed'), findsOneWidget);
      final Opacity o = t.widget<Opacity>(
        find.descendant(of: find.byType(NiaReveal), matching: find.byType(Opacity)),
      );
      expect(o.opacity, 1.0);
    });
  });
}
