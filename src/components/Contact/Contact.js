import styles from './Contact.module.css';
/* eslint no-unused-vars: 0 */

import { navigate } from 'gatsby';
import { Button } from 'antd';
import { Form } from '@ant-design/compatible';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';

const FormItem = Form.Item;
const { TextArea } = Input;
import '@ant-design/compatible/assets/index.css';
import 'antd/es/input/style/index.css';
import 'antd/es/button/style/index.css';

import { usePageContext } from '../../i18n';
import { useTranslation } from 'react-i18next';

const Contact = (props) => {
  const { getFieldDecorator } = props.form;
  const { lang } = usePageContext();
  const { t } = useTranslation();

  function encode(data) {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }

  function handleSubmit(e) {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        sendMessage(values);
      }
    });
  }

  function sendMessage(values) {
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({ 'form-name': 'contact', ...values }),
    })
      .then(() => {
        console.log('Form submission success');
        navigate(`/${lang}/success/`);
      })
      .catch((error) => {
        console.error('Form submission error:', error);
        handleNetworkError();
      });
  }

  function handleNetworkError(e) {
    console.log('submit Error');
  }

  return (
    <React.Fragment>
      <div className={`form ${styles['form']}`}>
        <p className={`intro ${styles['intro']}`}>
          {t('contact.intro')}{' '}
          <a
            href="https://calendly.com/oskar-dudycz/consulting"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('contact.bookCall')}
          </a>
        </p>
        <Form
          name="contact"
          onSubmit={handleSubmit}
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <FormItem label={t('contact.form.name')}>
            {getFieldDecorator('name', {
              rules: [
                {
                  whitespace: true,
                },
              ],
            })(<Input name="name" />)}
          </FormItem>
          <FormItem label={t('contact.form.email')}>
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: t('contact.form.emailError'),
                  whitespace: true,
                  type: 'email',
                },
              ],
            })(<Input name="email" />)}
          </FormItem>
          <FormItem label={t('contact.form.message')}>
            {getFieldDecorator('message', {
              rules: [
                { required: true, message: t('contact.form.messageError'), whitespace: true },
              ],
            })(<TextArea name="message" placeholder="" autosize={{ minRows: 4, maxRows: 10 }} />)}
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit">
              {t('contact.form.submit')}
            </Button>
          </FormItem>
        </Form>
      </div>
    </React.Fragment>
  );
};

Contact.propTypes = {
  form: PropTypes.object,
};

const ContactForm = Form.create({})(Contact);

export default ContactForm;
