// Xcode 26 / Swift 6.2 build fix for expo-modules-jsi 57.0.4.
//
// ExpoModulesJSI compiles with -cxx-interoperability-mode=default, which pulls C's
// abs() overloads into scope and makes the bare `abs(_:)` call in
// JavaScriptCodable+Date.swift ambiguous:
//
//   error: ambiguous use of 'abs'
//
// Swapping to Double.magnitude is equivalent and unambiguous. Idempotent: safe to
// run on every install. Remove this once upstream ships a fix.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const target =
  'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Date.swift';

if (!existsSync(target)) {
  console.log('[patch-expo-modules-jsi] not installed, nothing to do');
  process.exit(0);
}

const before = 'abs(milliseconds) <= maxJavaScriptDateMilliseconds';
const after = 'milliseconds.magnitude <= maxJavaScriptDateMilliseconds';
const source = readFileSync(target, 'utf8');

if (source.includes(after)) {
  console.log('[patch-expo-modules-jsi] already applied');
} else if (source.includes(before)) {
  writeFileSync(target, source.replace(before, after));
  console.log('[patch-expo-modules-jsi] applied');
} else {
  console.warn('[patch-expo-modules-jsi] pattern not found — upstream may have fixed this; verify before removing');
}
