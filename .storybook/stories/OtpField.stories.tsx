import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { OtpField } from "@/components/keepnoto/otp-field";

const meta = {
  title: "Product/OtpField",
  component: OtpField,
  parameters: { layout: "centered" },
} satisfies Meta<typeof OtpField>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulOtpField({ invalid = false, initialValue = "" }: { invalid?: boolean; initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue);
  return <OtpField invalid={invalid} onValueChange={setValue} value={value} />;
}

export const Empty: Story = {
  render: () => <StatefulOtpField />,
};

export const Filled: Story = {
  render: () => <StatefulOtpField initialValue="246810" />,
};

export const Invalid: Story = {
  render: () => <StatefulOtpField initialValue="246811" invalid />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onValueChange: () => undefined,
    value: "246810",
  },
};
