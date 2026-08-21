import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { adminLogin } from '../services/api';
import { useAdminAuth } from '../auth/authStore';

export function Login() {
    const { accessToken } = useAdminAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('admin@oryn.store');
    const [password, setPassword] = useState('ChangeMe123!');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (accessToken) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const session = await adminLogin(email, password);

            useAdminAuth.getState().setSession(session);

            navigate('/');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to sign in'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-editorial">
                <div className="login-brand">
                    <div className="brand-mark">O</div>

                    <div>
                        <strong>ORYN</strong>
                        <span>Commerce OS</span>
                    </div>
                </div>

                <div>
                    <p className="eyebrow">
                        Operations workspace
                    </p>

                    <h1>
                        Run the store
                        <br />
                        with intention.
                    </h1>

                    <p>
                        Catalog, inventory, orders and customer
                        operations in one quiet workspace.
                    </p>
                </div>

                <small>ORYN / INTERNAL</small>
            </section>

            <section className="login-panel">
                <div className="login-form-wrap">
                    <p className="eyebrow">
                        Administrator access
                    </p>

                    <h2>Sign in</h2>

                    <p className="login-copy">
                        Use an authorized ORYN administrator account.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label>
                            Email

                            <input
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                type="email"
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label>
                            Password

                            <input
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                type="password"
                                autoComplete="current-password"
                                required
                            />
                        </label>

                        {error && (
                            <div className="login-error">
                                <Icon
                                    name="CircleAlert"
                                    size={15}
                                />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-btn login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? 'Signing in…'
                                : 'Sign in'}

                            <Icon
                                name="ArrowRight"
                                size={15}
                            />
                        </button>
                    </form>

                    <p className="login-note">
                        Seed administrator:{' '}
                        <strong>admin@oryn.store</strong>
                        {' · '}
                        change the password before production.
                    </p>
                </div>
            </section>
        </main>
    );
}