/* eslint-disable @next/next/no-img-element */
"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { Controller, useForm } from "react-hook-form";
import { login } from "./auth/actions";

interface FormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoginError("");
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    const result = await login({ success: false, message: "" }, formData);
    if (result && !result.success) {
      setLoginError("Email ou senha incorretos.");
    }
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden filled">
      <div className="flex flex-column align-items-center justify-content-center p-5 gap-3 card">
        <div className="text-center">
          <Image
            src="/assets/image_login.jpg"
            alt="Logo"
            width={120}
            height={120}
            priority
            unoptimized
          />
          <div className="text-900 text-3xl font-medium mb-3">
            Bem vindo(a)!
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-column gap-2 w-full"
        >
          <label
            htmlFor="email"
            className="block text-900 text-xl font-medium mb-2"
          >
            Email
          </label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email é obrigatório",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              },
            }}
            render={({ field }) => (
              <>
                <InputText
                  {...field}
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className={`w-full md:w-30rem mb-2 p-3 ${errors.email ? "p-invalid" : ""}`}
                  aria-describedby="email-help"
                />
                {errors.email && (
                  <small id="email-help" className="p-error">
                    {errors.email.message}
                  </small>
                )}
              </>
            )}
          />

          <label
            htmlFor="password"
            className="block text-900 font-medium text-xl mb-2"
          >
            Senha
          </label>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Senha é obrigatória",
              minLength: {
                value: 6,
                message: "Senha deve ter no mínimo 6 caracteres",
              },
            }}
            render={({ field }) => (
              <>
                <Password
                  {...field}
                  inputId="password"
                  placeholder="••••••••"
                  feedback={false}
                  toggleMask
                  className={`w-full mb-2 ${errors.password ? "p-invalid" : ""}`}
                  inputClassName="w-full p-3 md:w-30rem"
                  aria-describedby="password-help"
                />
                {errors.password && (
                  <small id="password-help" className="p-error">
                    {errors.password.message}
                  </small>
                )}
              </>
            )}
          />

          {loginError && (
            <Message severity="error" text={loginError} className="w-full" />
          )}
          <Button label="Entrar" className="w-full p-3 text-xl" type="submit" />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
