"use client";
import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useActions";
import { authenticate } from "@/actions/common/authentication";
import { Input } from "@heroui/input";
import { Button } from "@heroui/react";
import Loading from "@/components/loading";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

function Page() {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const [, action, loading] = useAction(authenticate, [
    ,
    (response) => {
      if (response) {
        addToast({ title: "Login", description: response.message });
        router.push("/en/dashboard");
      } else {
        addToast({ title: "Login", description: "Login successful!" });
      }
    },
  ]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-sky-200/40 blur-3xl" />

      {/* Top bar with About */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/mindcare.png"
              alt="MindCare"
              width={36}
              height={36}
              className="rounded-md"
              priority
            />
            <span className="text-sm font-semibold text-gray-800">
              DARELKUBRA MINDCARE
            </span>
          </div>
          <Link href="/en/about">
            <Button variant="flat" color="secondary" className="backdrop-blur">
              About
            </Button>
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="relative z-10 mx-auto flex min-h-[70dvh] max-w-6xl items-center px-4">
        <div className="grid w-full gap-6 rounded-3xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur-md sm:p-6 lg:grid-cols-2">
          {/* Visual / messaging */}
          <div className="relative hidden overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-sky-600 lg:block">
            <Image
              src="/mindcare.png"
              alt="Welcome to MindCare"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover opacity-20"
              priority
            />
            <div className="relative z-10 p-8 text-white">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs">
                Compassionate • Secure • Simple
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight">
                Welcome back
              </h2>
              <p className="mt-3 text-white/90">
                Sign in to manage general cases, appointments, and student
                wellbeing with clarity and confidence.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-white/90">
                <li>• Streamlined case workflows</li>
                <li>• Privacy-first by design</li>
                <li>• Outcome-driven reporting</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="flex items-center">
            <div className="w-full rounded-2xl bg-white/80 p-6 backdrop-blur">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sign in to your account
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Enter your credentials to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit(action)} className="space-y-5">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    variant="bordered"
                    placeholder="e.g. 09xxxxxxx"
                    {...register("phone")}
                    className="w-full"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-gray-800"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    variant="bordered"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  isDisabled={loading}
                  color="primary"
                  variant="solid"
                  type="submit"
                  className="w-full"
                >
                  {loading ? <Loading /> : "Login"}
                </Button>

                <div className="text-center text-xs text-gray-500">
                  By continuing you agree to our{" "}
                  <span className="underline">Privacy Policy</span>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} DARELKUBRA MINDCARE
        </div>
      </footer>
    </div>
  );
}

export default Page;
