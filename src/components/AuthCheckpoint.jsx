function AuthCheckpoint({
    onLogin,
    onGuest,
}) {
    return (
        <section className="mb-6 rounded-[14px] border border-[#e5e5e5] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.025)] sm:p-7">
            <div className="mx-auto max-w-[620px] text-center p-3">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f5] text-[#222]">
                    <span className="text-[18px] font-semibold">01</span>
                </div>

                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a6a24]">
                    Almost there
                </p>

                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#222]">
                    Continue with your booking
                </h3>

                <p className="mx-auto mt-2 max-w-[500px] text-[14px] leading-[1.6] text-[#666]">
                    You can sign in to your account or continue without an
                    account.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
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