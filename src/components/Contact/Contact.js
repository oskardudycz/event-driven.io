/* eslint no-unused-vars: 0 */

import { navigate } from "gatsby";
import { Button } from "antd";
import { Form } from "@ant-design/compatible";
import { Input } from "antd";
import PropTypes from "prop-types";
import React from "react";

const FormItem = Form.Item;
const { TextArea } = Input;
import "@ant-design/compatible/assets/index.css";
import "antd/es/input/style/index.css";
import "antd/es/button/style/index.css";
import { ThemeContext } from "../../layouts";
import { usePageContext } from "../../i18n";
import { useTranslation } from "react-i18next";

const Contact = (props) => {
  const { getFieldDecorator } = props.form;
  const { lang } = usePageContext();
  const { t } = useTranslation();

  function encode(data) {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  function handleSubmit(e) {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        sendMessage(values);
      }
    });
  }

  function sendMessage(values) {
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "contact", ...values }),
    })
      .then(() => {
        console.log("Form submission success");
        navigate(`/${lang}/success/`);
      })
      .catch((error) => {
        console.error("Form submission error:", error);
        handleNetworkError();
      });
  }

  function handleNetworkError(e) {
    console.log("submit Error");
  }

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <div className="form">
            <p className="intro">
              {t("contact.intro")}{" "}
              <a
                href="https://calendly.com/oskar-dudycz/consulting"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("contact.bookCall")}
              </a>
            </p>
            <Form
              name="contact"
              onSubmit={handleSubmit}
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <FormItem label={t("contact.form.name")}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      whitespace: true,
                    },
                  ],
                })(<Input name="name" />)}
              </FormItem>
              <FormItem label={t("contact.form.email")}>
                {getFieldDecorator("email", {
                  rules: [
                    {
                      required: true,
                      message: t("contact.form.emailError"),
                      whitespace: true,
                      type: "email",
                    },
                  ],
                })(<Input name="email" />)}
              </FormItem>
              <FormItem label={t("contact.form.message")}>
                {getFieldDecorator("message", {
                  rules: [
                    { required: true, message: t("contact.form.messageError"), whitespace: true },
                  ],
                })(
                  <TextArea name="message" placeholder="" autosize={{ minRows: 4, maxRows: 10 }} />
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" htmlType="submit">
                  {t("contact.form.submit")}
                </Button>
              </FormItem>
            </Form>

            {/* --- STYLES --- */}
            <style jsx>{`
              .form {
                background: transparent;
              }
              .intro {
                font-size: ${theme.font.size.s};
                line-height: ${theme.font.lineHeight.l};
                margin-bottom: ${theme.space.l};
              }
              .intro :global(a) {
                color: ${theme.color.brand.primary};
                font-weight: ${theme.font.weight.bold};
                text-decoration: underline;
              }
              .form :global(.ant-row.ant-form-item) {
                margin: 0 0 1em;
              }
              .form :global(.ant-row.ant-form-item:last-child) {
                margin-top: 1em;
              }
              .form :global(.ant-form-item-control) {
                line-height: 1em;
              }
              .form :global(.ant-form-item-label) {
                line-height: 1em;
                margin-bottom: 0.5em;
              }
              .form :global(.ant-form-item) {
                margin: 0;
              }
              .form :global(.ant-input) {
                appearance: none;
                height: auto;
                font-size: 1.2em;
                padding: 0.5em 0.6em;
              }
              .form :global(.ant-btn-primary) {
                height: auto;
                font-size: 1.2em;
                padding: 0.5em 3em;
                background: ${theme.color.brand.primary};
                border: 1px solid ${theme.color.brand.primary};
              }
              .form :global(.ant-form-explain) {
                margin-top: 0.2em;
              }

              @from-width desktop {
                .form :global(input) {
                  max-width: 50%;
                }
              }
            `}</style>
          </div>
        )}
      </ThemeContext.Consumer>
    </React.Fragment>
  );
};

Contact.propTypes = {
  form: PropTypes.object,
};

const ContactForm = Form.create({})(Contact);

export default ContactForm;
