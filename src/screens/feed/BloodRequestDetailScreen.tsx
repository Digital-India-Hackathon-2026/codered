import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/shared/Icon';
import { colors, radius, fonts } from '../../theme';
import api from '../../api/client';

const URGENCY_COLORS = { critical: '#DC2626', urgent: '#F59E0B', normal: '#10B981' };

export const BloodRequestDetailScreen = ({ route, navigation }: any) => {
  const { request } = route.params;
  const [offered, setOffered] = useState(false);

  const handleOffer = async () => {
    setOffered(true);
    try { await api.post(`/blood-requests/${request.id}/offer`); } catch {}
    Alert.alert('Thank you!', 'The requester will be notified of your offer.');
  };

  const urgencyColor = URGENCY_COLORS[request.urgency as keyof typeof URGENCY_COLORS] || colors.textTertiary;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="ArrowLeft" size={22} color={colors.text} weight="regular" />
        </Pressable>
        <Text style={s.headerTitle}>Blood Request</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Urgency Banner */}
        <View style={[s.urgencyBanner, { backgroundColor: urgencyColor + '15' }]}>
          <View style={[s.urgencyDot, { backgroundColor: urgencyColor }]} />
          <Text style={[s.urgencyText, { color: urgencyColor }]}>
            {request.urgency?.toUpperCase()} REQUEST
          </Text>
        </View>

        {/* Blood Group Badge */}
        <View style={s.bloodGroupWrap}>
          <View style={s.bloodGroupBadge}>
            <Icon name="Drop" size={24} color={colors.coral} weight="fill" />
            <Text style={s.bloodGroupText}>{request.blood_group}</Text>
          </View>
          <Text style={s.unitsText}>{request.units || 1} unit(s) needed</Text>
        </View>

        {/* Details Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Details</Text>

          <View style={s.row}>
            <Icon name="User" size={16} color={colors.textTertiary} weight="regular" />
            <Text style={s.rowLabel}>Patient</Text>
            <Text style={s.rowValue}>{request.patient_name || 'Not disclosed'}</Text>
          </View>

          <View style={s.row}>
            <Icon name="Hospital" size={16} color={colors.textTertiary} weight="regular" />
            <Text style={s.rowLabel}>Hospital</Text>
            <Text style={s.rowValue}>{request.hospital || 'Not specified'}</Text>
          </View>

          <View style={s.row}>
            <Icon name="MapPin" size={16} color={colors.textTertiary} weight="regular" />
            <Text style={s.rowLabel}>Location</Text>
            <Text style={s.rowValue}>{request.city || request.location || 'Not specified'}</Text>
          </View>

          <View style={s.row}>
            <Icon name="Calendar" size={16} color={colors.textTertiary} weight="regular" />
            <Text style={s.rowLabel}>Needed by</Text>
            <Text style={s.rowValue}>{request.needed_by || 'ASAP'}</Text>
          </View>

          {request.contact_number && (
            <View style={s.row}>
              <Icon name="Phone" size={16} color={colors.textTertiary} weight="regular" />
              <Text style={s.rowLabel}>Contact</Text>
              <Pressable onPress={() => Linking.openURL(`tel:${request.contact_number}`)}>
                <Text style={[s.rowValue, { color: colors.coral }]}>{request.contact_number}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Additional Notes */}
        {request.notes && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Additional Notes</Text>
            <Text style={s.notes}>{request.notes}</Text>
          </View>
        )}

        {/* Donors who offered */}
        {request.offers_count > 0 && (
          <View style={s.offersRow}>
            <Icon name="Users" size={14} color={colors.sage} weight="regular" />
            <Text style={s.offersText}>{request.offers_count} donor(s) have offered</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        <Pressable
          style={[s.offerBtn, offered && s.offeredBtn]}
          onPress={offered ? undefined : handleOffer}
        >
          <Icon name={offered ? 'Check' : 'Drop'} size={18} color={colors.textInverse} weight="bold" />
          <Text style={s.offerBtnText}>{offered ? 'Offer Sent' : 'I Can Donate'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 16, color: colors.text },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  urgencyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, marginBottom: 20 },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  urgencyText: { fontFamily: fonts.generalSans.semiBold, fontSize: 12, letterSpacing: 0.5 },
  bloodGroupWrap: { alignItems: 'center', marginBottom: 24 },
  bloodGroupBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.coralSoft, borderRadius: radius.xl, paddingHorizontal: 20, paddingVertical: 14 },
  bloodGroupText: { fontFamily: fonts.fraunces.bold, fontSize: 28, color: colors.coral },
  unitsText: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.textSecondary, marginTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  cardTitle: { fontFamily: fonts.generalSans.semiBold, fontSize: 14, color: colors.text, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rowLabel: { fontFamily: fonts.generalSans.regular, fontSize: 13, color: colors.textTertiary, width: 70 },
  rowValue: { fontFamily: fonts.generalSans.medium, fontSize: 13, color: colors.text, flex: 1 },
  notes: { fontFamily: fonts.generalSans.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  offersRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 },
  offersText: { fontFamily: fonts.generalSans.medium, fontSize: 12, color: colors.sage },
  bottomBar: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  offerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.coral, borderRadius: radius.md, paddingVertical: 14 },
  offeredBtn: { backgroundColor: colors.sage },
  offerBtnText: { fontFamily: fonts.generalSans.semiBold, fontSize: 15, color: colors.textInverse },
});
