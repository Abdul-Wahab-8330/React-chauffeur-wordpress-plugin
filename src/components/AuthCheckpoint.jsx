function AuthCheckpoint({
    onLogin,
    onGuest,
}) {
    return (
        <section className="rounded-[24px] bg-transparent p-6 text-center sm:p-8">
            <div className="mx-auto max-w-[620px]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,162,39,0.35)] bg-gradient-to-br from-[#f5e7bd] to-[#e6c763] text-[#332a0c] shadow-[0_8px_20px_rgba(201,162,39,0.25)]">
                    <span className="text-[18px] font-bold">01</span>
                </div>

                <p className="oasis-eyebrow mb-2">
                    Almost there
                </p>

                <h3 className="oasis-section-title mb-2">
                    Continue with your booking
                </h3>

                <p className="mx-auto mt-2 max-w-[500px] text-[14px] leading-[1.65] text-[#55554f]">
                    You can sign in to your account or continue without an
                    account.
                </p>

                <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={onLogin}
                        className="oasis-auth-primary-button"
                    >
                        Login / Register
                    </button>

                    <button
                        type="button"
                        onClick={onGuest}
                        className="oasis-auth-secondary-button"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AuthCheckpoint