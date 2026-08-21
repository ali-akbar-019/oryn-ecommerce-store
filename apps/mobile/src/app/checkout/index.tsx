import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { MapPin, CreditCard, Truck, Check, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { addressApi, orderApi, shippingApi, type Address, type ShippingMethod } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutScreen() {
    const items = useCartStore((s) => s.items);
    const hydrateCart = useCartStore((s) => s.hydrate);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [addressId, setAddressId] = useState('');
    const [shippingId, setShippingId] = useState('');
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [a, sm] = await Promise.all([
                    addressApi.list(),
                    shippingApi.list()
                ]);
                setAddresses(a);
                setShippingMethods(sm);
                setAddressId(a.find((x) => x.isDefault)?.id ?? a[0]?.id ?? '');
                setShippingId(sm[0]?.id ?? '');
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to load checkout.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const subtotal = useMemo(() =>
        items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [items]
    );

    const selectedShipping = shippingMethods.find((x) => x.id === shippingId);
    const shipping = Number(selectedShipping?.price ?? 0);
    const total = subtotal + shipping;

    const place = async () => {
        if (!addressId) {
            setError('Choose a delivery address before placing your order.');
            return;
        }
        if (!shippingId) {
            setError('Choose a delivery method before placing your order.');
            return;
        }

        setPlacing(true);
        setError(null);

        try {
            const order = await orderApi.create({
                addressId,
                shippingMethodId: shippingId,
                currency: 'USD'
            });
            await orderApi.mockPayment(order.id, 'success');
            await hydrateCart();
            router.replace({
                pathname: '/checkout/confirmation',
                params: { orderId: order.id }
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unable to place your order.');
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text style={styles.copy}>Preparing secure checkout…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Intro */}
            <View style={styles.intro}>
                <Text style={styles.eyebrow}>SECURE CHECKOUT</Text>
                <Text style={styles.title}>Complete your order.</Text>
                <Text style={styles.copy}>
                    Your delivery details, shipping and final total are confirmed before the order is created.
                </Text>
            </View>

            {error ? (
                <View style={styles.error}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* Delivery Address Section */}
            <Section
                icon={MapPin}
                title="Delivery address"
                detail={addresses.find((a) => a.id === addressId)?.label ?? 'Choose an address'}
                onPress={() => router.push('/profile/addresses')}
            />

            {addresses.length ? (
                <View style={styles.choices}>
                    {addresses.map((a) => (
                        <Pressable
                            key={a.id}
                            onPress={() => setAddressId(a.id)}
                            style={[styles.choice, addressId === a.id && styles.selected]}
                        >
                            <View style={styles.radio}>
                                {addressId === a.id ? <View style={styles.radioDot} /> : null}
                            </View>
                            <View style={styles.choiceCopy}>
                                <Text style={styles.choiceTitle}>
                                    {a.label}{a.isDefault ? ' · Default' : ''}
                                </Text>
                                <Text style={styles.choiceText}>
                                    {a.line1}, {a.city} {a.postalCode}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyChoice}>
                    <Text style={styles.copy}>No saved address. Add one before placing the order.</Text>
                    <Button
                        label="Add address"
                        variant="secondary"
                        onPress={() => router.push('/profile/addresses')}
                    />
                </View>
            )}

            {/* Delivery Method Section */}
            <Section
                icon={Truck}
                title="Delivery method"
                detail={selectedShipping ? `${selectedShipping.name} · $${shipping.toFixed(2)}` : 'Choose delivery'}
            />

            {shippingMethods.map((sm) => (
                <Pressable
                    key={sm.id}
                    onPress={() => setShippingId(sm.id)}
                    style={[styles.shipping, shippingId === sm.id && styles.selected]}
                >
                    <View style={styles.radio}>
                        {shippingId === sm.id ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.choiceCopy}>
                        <Text style={styles.choiceTitle}>
                            {sm.name} · ${Number(sm.price).toFixed(2)}
                        </Text>
                        <Text style={styles.choiceText}>
                            {sm.description || 'Reliable delivery to your saved address.'}
                        </Text>
                    </View>
                    <Check
                        size={16}
                        color={shippingId === sm.id ? colors.accent : colors.textMuted}
                    />
                </Pressable>
            ))}

            {/* Payment Section */}
            <Section
                icon={CreditCard}
                title="Payment"
                detail="Mock payment · success mode"
                onPress={() => Alert.alert(
                    'Payment',
                    'Payments are intentionally mocked for this build. The order will be marked paid after confirmation.'
                )}
            />

            {/* Order Summary */}
            <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Order summary</Text>
                {items.map((i) => (
                    <View key={i.key} style={styles.line}>
                        <View style={styles.lineText}>
                            <Text style={styles.itemName}>{i.name}</Text>
                            <Text style={styles.itemMeta}>
                                {i.quantity} × ${i.price.toFixed(2)}
                            </Text>
                        </View>
                        <Text style={styles.amount}>
                            ${(i.price * i.quantity).toFixed(2)}
                        </Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`} />
                <Row label="Total" value={`$${total.toFixed(2)}`} strong />
            </View>

            <Button
                label={placing ? 'Placing order…' : 'Place order'}
                loading={placing}
                disabled={placing || !items.length}
                onPress={place}
                style={styles.cta}
            />

            <Text style={styles.note}>
                The server validates inventory, address, shipping and pricing before creating the order.
            </Text>
        </ScrollView>
    );
}

function Section({
    icon: Icon,
    title,
    detail,
    onPress
}: {
    icon: any;
    title: string;
    detail: string;
    onPress?: () => void;
}) {
    const content = (
        <>
            <Icon size={19} color={colors.text} />
            <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionDetail}>{detail}</Text>
            </View>
            {onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null}
        </>
    );

    return onPress ? (
        <Pressable onPress={onPress} style={styles.section}>
            {content}
        </Pressable>
    ) : (
        <View style={styles.section}>{content}</View>
    );
}

function Row({
    label,
    value,
    strong
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <View style={styles.row}>
            <Text style={strong ? styles.totalLabel : styles.label}>{label}</Text>
            <Text style={strong ? styles.totalValue : styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.xl,
        paddingBottom: 48
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background
    },
    intro: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl
    },
    eyebrow: {
        ...typography.label,
        color: colors.textMuted,
        letterSpacing: 1.5
    },
    title: {
        ...typography.display,
        fontSize: 32,
        lineHeight: 38,
        marginTop: 8
    },
    copy: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 23,
        marginTop: 12,
        maxWidth: 340
    },
    error: {
        borderWidth: 1,
        borderColor: colors.danger,
        padding: 12,
        marginBottom: 12
    },
    errorText: {
        ...typography.caption,
        color: colors.danger
    },
    section: {
        minHeight: 76,
        borderTopWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14
    },
    sectionText: {
        flex: 1
    },
    sectionTitle: {
        ...typography.bodyMedium
    },
    sectionDetail: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 4
    },
    choices: {
        borderBottomWidth: 1,
        borderColor: colors.border
    },
    choice: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderColor: colors.border,
        gap: 12,
        paddingLeft: 8
    },
    selected: {
        backgroundColor: colors.surfaceMuted
    },
    radio: {
        width: 18,
        height: 18,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioDot: {
        width: 8,
        height: 8,
        backgroundColor: colors.accent
    },
    choiceCopy: {
        flex: 1
    },
    choiceTitle: {
        ...typography.bodyMedium
    },
    choiceText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 3
    },
    emptyChoice: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: colors.border
    },
    shipping: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: colors.border,
        gap: 12,
        paddingLeft: 8
    },
    summary: {
        marginTop: spacing.xxl,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.lg
    },
    summaryTitle: {
        ...typography.h3,
        marginBottom: spacing.lg
    },
    line: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14
    },
    lineText: {
        flex: 1,
        paddingRight: 12
    },
    itemName: {
        ...typography.bodyMedium
    },
    itemMeta: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 3
    },
    amount: {
        ...typography.bodyMedium
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 6
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7
    },
    label: {
        ...typography.body,
        color: colors.textSecondary
    },
    value: {
        ...typography.body
    },
    totalLabel: {
        ...typography.bodyMedium
    },
    totalValue: {
        ...typography.h3
    },
    cta: {
        marginTop: spacing.xl
    },
    note: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: 12
    }
});