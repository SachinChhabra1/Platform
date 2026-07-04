import 'package:flutter_test/flutter_test.dart';
import 'package:member/features/niabook/niabook_scenario.dart';

/// Unit coverage for the pure money formatter behind every ₹ figure on NiaBook.
/// `formatPaise` renders integer paise as Indian-grouped rupees; it is critical
/// and had no test. Pure logic — no widgets, no golden impact.

void main() {
  group('formatPaise — Indian digit grouping', () {
    test('zero', () => expect(formatPaise(0), '₹0'));

    test('no grouping under 1,000 rupees', () {
      expect(formatPaise(10000), '₹100'); // 10000 paise = ₹100
      expect(formatPaise(99900), '₹999');
    });

    test('thousands get a single comma before the last 3 digits', () {
      expect(formatPaise(100000), '₹1,000'); // ₹1,000
      expect(formatPaise(348000), '₹3,480'); // the NiaBook sample figure
      expect(formatPaise(1234500), '₹12,345');
    });

    test('lakh grouping (groups of two above the last three)', () {
      expect(formatPaise(10000000), '₹1,00,000'); // ₹1,00,000
      expect(formatPaise(1234567800), '₹1,23,45,678'); // crore grouping
    });

    test('negative amounts keep the sign before the ₹', () {
      expect(formatPaise(-500000), '-₹5,000');
      expect(formatPaise(-100000), '-₹1,000');
    });

    test('rounds paise to the nearest rupee, half away from zero', () {
      expect(formatPaise(349), '₹3'); // 3.49 → 3
      expect(formatPaise(350), '₹4'); // 3.50 → 4
    });
  });

  group('NiaBookMonth.sample — invariants the UI relies on', () {
    final NiaBookMonth m = NiaBookMonth.sample;

    test('has closed progress on the left and opportunities on the right', () {
      expect(m.becameTrue, isNotEmpty);
      expect(m.opportunities, isNotEmpty);
    });

    test('exactly one hero opportunity', () {
      expect(m.opportunities.where((Opportunity o) => o.hero).length, 1);
    });
  });
}
