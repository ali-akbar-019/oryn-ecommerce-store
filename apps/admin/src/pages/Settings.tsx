import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { adminData } from '../services/adminData';

type Settings = {
  storeName: string;
  currency: string;
  defaultShippingId: string | null;
  returnWindowDays: number;
  sessionHours: number;
  editorialTheme: boolean;
};

type ShippingMethod = {
  id: string;
  name: string;
  price: string | number;
};

export function Settings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [shipping, setShipping] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminData.settings();
      setForm(response.data.settings);
      setShipping(response.data.shipping ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!form) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await adminData.updateSettings({
        ...form,
        returnWindowDays: Number(form.returnWindowDays),
        sessionHours: Number(form.sessionHours)
      });
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="state-view">
        <div className="loader-line" />
        <p>Loading settings…</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="state-view">
        <p>{error}</p>
        <button className="secondary-btn" onClick={loadSettings}>
          Retry
        </button>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Control</p>
          <h2>Settings</h2>
          <p>Configure persisted ORYN store behavior without changing application code.</p>
        </div>
        <button className="primary-btn" disabled={saving} onClick={saveSettings}>
          <Icon name="Save" size={16} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Notifications */}
      {message && <div className="notice success-notice">{message}</div>}
      {error && <div className="notice error-notice">{error}</div>}

      {/* Settings Sections */}
      <div className="settings-sections">
        {/* Store Identity */}
        <section className="settings-section">
          <div className="settings-section-head">
            <div>
              <p className="eyebrow">Store identity</p>
              <h3>General</h3>
              <p>Core storefront values used by the commerce platform.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Store name
              <input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />
            </label>
            <label>
              Currency
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>PKR</option>
              </select>
            </label>
          </div>
        </section>

        {/* Commerce */}
        <section className="settings-section">
          <div className="settings-section-head">
            <div>
              <p className="eyebrow">Commerce</p>
              <h3>Store behavior</h3>
              <p>Default delivery and customer policy values.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Default shipping method
              <select
                value={form.defaultShippingId ?? ''}
                onChange={(e) =>
                  setForm({ ...form, defaultShippingId: e.target.value || null })
                }
              >
                <option value="">No default</option>
                {shipping.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} · ${Number(method.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Return window (days)
              <input
                type="number"
                min="0"
                max="365"
                value={form.returnWindowDays}
                onChange={(e) =>
                  setForm({ ...form, returnWindowDays: Number(e.target.value) })
                }
              />
            </label>
          </div>
        </section>

        {/* Security */}
        <section className="settings-section">
          <div className="settings-section-head">
            <div>
              <p className="eyebrow">Security</p>
              <h3>Session policy</h3>
              <p>Controls the administrative session lifetime.</p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Session duration (hours)
              <input
                type="number"
                min="1"
                max="168"
                value={form.sessionHours}
                onChange={(e) =>
                  setForm({ ...form, sessionHours: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Editorial storefront theme
              <select
                value={form.editorialTheme ? 'enabled' : 'disabled'}
                onChange={(e) =>
                  setForm({ ...form, editorialTheme: e.target.value === 'enabled' })
                }
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}