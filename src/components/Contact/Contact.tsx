import React from 'react';
import { navigate } from 'gatsby';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { usePageContext } from '../../i18n/index.ts';
import * as styles from './Contact.module.css';

type ContactValues = { name?: string; email: string; message: string };

// This form remains inactive until hosted Netlify form handling is verified.
// The live contact page continues to offer the existing booking link.
export default function Contact() {
  const { lang } = usePageContext();
  const { t } = useTranslation();

  async function sendMessage(values: ContactValues) {
    const body = new URLSearchParams({
      'form-name': 'contact',
      name: values.name || '',
      email: values.email,
      message: values.message,
    });
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!response.ok) throw new Error(`Form submission: ${response.status}`);
      navigate(`/${lang}/success/`);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }

  return (
    <div className={`form ${styles.form}`}>
      <p className={`intro ${styles.intro}`}>
        {t('contact.intro')}{' '}
        <a
          href="https://calendly.com/oskar-dudycz/consulting"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('contact.bookCall')}
        </a>
      </p>
      <Form<ContactValues>
        name="contact"
        layout="vertical"
        onFinish={sendMessage}
        data-netlify="true"
        data-netlify-honeypot="bot-field"
      >
        <Form.Item
          name="name"
          label={t('contact.form.name')}
          rules={[{ whitespace: true }]}
        >
          <Input name="name" />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('contact.form.email')}
          rules={[
            {
              required: true,
              message: t('contact.form.emailError'),
              whitespace: true,
              type: 'email',
            },
          ]}
        >
          <Input name="email" />
        </Form.Item>
        <Form.Item
          name="message"
          label={t('contact.form.message')}
          rules={[
            {
              required: true,
              message: t('contact.form.messageError'),
              whitespace: true,
            },
          ]}
        >
          <Input.TextArea
            name="message"
            placeholder=""
            autoSize={{ minRows: 4, maxRows: 10 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {t('contact.form.submit')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
