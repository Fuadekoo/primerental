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
import { ArrowRight } from "lucide-react";

function Page() {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  // This block is kept exactly as you requested.
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
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full bg-violet-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 -bottom-48 h-[32rem] w-[32rem] rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative w-full max-w-4xl">
        <div className="grid overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-xl backdrop-blur-lg lg:grid-cols-2">
          {/* Visual / Messaging Panel */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-300 to-sky-300 p-8 lg:flex">
            <Image
              src="/logo.png"
              alt="Primerental Illustration"
              width={800}
              height={800}
              className="absolute inset-0 h-full w-full object-cover opacity-15"
              priority
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Primerental Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-white">
                PRIMERENTAL
              </span>
              </div>
              <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white">
              Your trusted platform for student housing.
              </h2>
              <p className="mt-3 text-white/80">
              Find, manage, and secure student rentals with ease. Primerental connects students and landlords for a seamless rental experience.
              </p>
            </div>
            <div className="relative z-10 mt-8 text-xs text-white/60">
              © {new Date().getFullYear()} PRIMERENTAL
            </div>
            </div>

          {/* Form Panel */}
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="w-full">
              <div className="mb-6 text-center lg:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Please sign in to continue.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(action)}
                className="w-full space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email or Phone
                  </label>
                  <Input
                    id="email"
                    type="text"
                    variant="bordered"
                    placeholder="you@example.com or 09..."
                    {...register("email")}
                    className="w-full"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <Link
                      href="#"
                      className="text-xs font-medium text-violet-600 hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
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
                  className="w-full font-semibold"
                >
                  {loading ? (
                    <Loading />
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  No account?{" "}
                  <Link
                    href="/en/signup"
                    className="font-medium text-violet-600 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
