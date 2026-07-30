import { UiIcon } from "../app/components/UiIcon";

const decorative = <UiIcon decorative name="dashboard" />;
const meaningful = <UiIcon label="Dashboard" name="dashboard" />;
const framed = <UiIcon decorative frame="soft" name="palette" size="2rem" />;

const missingAccessibilityIntent = (
  // @ts-expect-error Accessibility intent is required.
  <UiIcon name="dashboard" />
);

const conflictingAccessibilityIntent = (
  // @ts-expect-error Decorative icons cannot also announce a label.
  <UiIcon decorative label="Dashboard" name="dashboard" />
);

const unknownIcon = (
  // @ts-expect-error Icon names are restricted to the published contract.
  <UiIcon decorative name="not-a-published-icon" />
);

void [
  decorative,
  meaningful,
  framed,
  missingAccessibilityIntent,
  conflictingAccessibilityIntent,
  unknownIcon,
];
