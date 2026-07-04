import 'package:flutter/material.dart';

import 'app.dart';
import 'widgets/nia_error_boundary.dart';

void main() {
  installNiaCrashBoundary();
  runApp(const NiaMemberApp());
}
