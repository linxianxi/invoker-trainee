import { Checkbox, Form, Input, Modal, ModalProps } from "antd";
import React, { FC, useCallback, useEffect } from "react";

interface ChangeKeyboardModalProps extends ModalProps {
  isDotaKeyboard: boolean;
  keyboardSetting: any;
  onSubmit: (values: any) => void;
}

export const ChangeKeyboardModal: FC<ChangeKeyboardModalProps> = ({
  visible,
  keyboardSetting,
  isDotaKeyboard,
  onSubmit,
  ...props
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        isDotaKeyboard,
        ...keyboardSetting,
      });
    }
  }, [form, isDotaKeyboard, keyboardSetting, visible]);

  const onFinish = useCallback(
    (values: any) => {
      onSubmit(values);
    },
    [onSubmit]
  );

  return (
    <Modal
      visible={visible}
      title="改键"
      okText="确定"
      cancelText="取消"
      onOk={form.submit}
      {...props}
    >
      <Form
        requiredMark={false}
        form={form}
        onFinish={onFinish}
        onValuesChange={(changedValues) => {
          const name = Object.keys(changedValues)[0];
          const value = Object.values(changedValues)[0] as string;
          if (name !== "isDotaKeyboard") {
            form.setFieldsValue({
              [name]: value ? value[value.length - 1].toLowerCase() : "",
            });
          }
        }}
      >
        <Form.Item name="isDotaKeyboard" valuePropName="checked">
          <Checkbox>dota 键位</Checkbox>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.isDotaKeyboard !== currentValues.isDotaKeyboard
          }
        >
          {({ getFieldValue }) =>
            !getFieldValue("isDotaKeyboard") && (
              <div style={{ display: "flex" }}>
                <Form.Item name="q" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="冰" />
                </Form.Item>
                <Form.Item name="w" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="雷" />
                </Form.Item>
                <Form.Item name="e" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="火" />
                </Form.Item>
                <Form.Item name="r" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="大招" />
                </Form.Item>
                <Form.Item name="d" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="技能1" />
                </Form.Item>
                <Form.Item name="f" rules={[{ required: true, message: "" }]}>
                  <Input placeholder="技能2" />
                </Form.Item>
              </div>
            )
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};
