import React from 'react';
import {
  View,
  ScrollView,
  Modal,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { CaretDownIcon } from 'phosphor-react-native';
import { Input } from '../../../../../components/common/Input';
import { Button } from '../../../../../components/common/Button';
import { DatePicker } from '../../../../../components/common/DatePicker';
import { BaseAuthLayout } from '../../../../../components/auth/BaseAuthLayout';
import { RegistrationData } from '../../../../../types';
import { colors } from '../../../../../theme/colors';
import { styles } from './styles';

const COUNTRY_CODE_OPTIONS = [
  'Afghanistan (+93)',
  'Albania (+355)',
  'Algeria (+213)',
  'Andorra (+376)',
  'Angola (+244)',
  'Antigua and Barbuda (+1)',
  'Argentina (+54)',
  'Armenia (+374)',
  'Australia (+61)',
  'Austria (+43)',
  'Azerbaijan (+994)',
  'Bahamas (+1)',
  'Bahrain (+973)',
  'Bangladesh (+880)',
  'Barbados (+1)',
  'Belarus (+375)',
  'Belgium (+32)',
  'Belize (+501)',
  'Benin (+229)',
  'Bhutan (+975)',
  'Bolivia (+591)',
  'Bosnia and Herzegovina (+387)',
  'Botswana (+267)',
  'Brazil (+55)',
  'Brunei (+673)',
  'Bulgaria (+359)',
  'Burkina Faso (+226)',
  'Burundi (+257)',
  'Cambodia (+855)',
  'Cameroon (+237)',
  'Canada (+1)',
  'Cape Verde (+238)',
  'Central African Republic (+236)',
  'Chad (+235)',
  'Chile (+56)',
  'China (+86)',
  'Colombia (+57)',
  'Comoros (+269)',
  'Congo (+242)',
  'Costa Rica (+506)',
  'Croatia (+385)',
  'Cuba (+53)',
  'Cyprus (+357)',
  'Czech Republic (+420)',
  'Democratic Republic of the Congo (+243)',
  'Denmark (+45)',
  'Djibouti (+253)',
  'Dominica (+1)',
  'Dominican Republic (+1)',
  'Ecuador (+593)',
  'Egypt (+20)',
  'El Salvador (+503)',
  'Equatorial Guinea (+240)',
  'Eritrea (+291)',
  'Estonia (+372)',
  'Eswatini (+268)',
  'Ethiopia (+251)',
  'Fiji (+679)',
  'Finland (+358)',
  'France (+33)',
  'Gabon (+241)',
  'Gambia (+220)',
  'Georgia (+995)',
  'Germany (+49)',
  'Ghana (+233)',
  'Greece (+30)',
  'Grenada (+1)',
  'Guatemala (+502)',
  'Guinea (+224)',
  'Guinea-Bissau (+245)',
  'Guyana (+592)',
  'Haiti (+509)',
  'Honduras (+504)',
  'Hungary (+36)',
  'Iceland (+354)',
  'India (+91)',
  'Indonesia (+62)',
  'Iran (+98)',
  'Iraq (+964)',
  'Ireland (+353)',
  'Israel (+972)',
  'Italy (+39)',
  'Jamaica (+1)',
  'Japan (+81)',
  'Jordan (+962)',
  'Kazakhstan (+7)',
  'Kenya (+254)',
  'Kiribati (+686)',
  'Kuwait (+965)',
  'Kyrgyzstan (+996)',
  'Laos (+856)',
  'Latvia (+371)',
  'Lebanon (+961)',
  'Lesotho (+266)',
  'Liberia (+231)',
  'Libya (+218)',
  'Liechtenstein (+423)',
  'Lithuania (+370)',
  'Luxembourg (+352)',
  'Madagascar (+261)',
  'Malawi (+265)',
  'Malaysia (+60)',
  'Maldives (+960)',
  'Mali (+223)',
  'Malta (+356)',
  'Marshall Islands (+692)',
  'Mauritania (+222)',
  'Mauritius (+230)',
  'Mexico (+52)',
  'Micronesia (+691)',
  'Moldova (+373)',
  'Monaco (+377)',
  'Mongolia (+976)',
  'Montenegro (+382)',
  'Morocco (+212)',
  'Mozambique (+258)',
  'Myanmar (+95)',
  'Namibia (+264)',
  'Nauru (+674)',
  'Nepal (+977)',
  'Netherlands (+31)',
  'New Zealand (+64)',
  'Nicaragua (+505)',
  'Niger (+227)',
  'Nigeria (+234)',
  'North Korea (+850)',
  'North Macedonia (+389)',
  'Norway (+47)',
  'Oman (+968)',
  'Pakistan (+92)',
  'Palau (+680)',
  'Palestine (+970)',
  'Panama (+507)',
  'Papua New Guinea (+675)',
  'Paraguay (+595)',
  'Peru (+51)',
  'Philippines (+63)',
  'Poland (+48)',
  'Portugal (+351)',
  'Qatar (+974)',
  'Romania (+40)',
  'Russia (+7)',
  'Rwanda (+250)',
  'Saint Kitts and Nevis (+1)',
  'Saint Lucia (+1)',
  'Saint Vincent and the Grenadines (+1)',
  'Samoa (+685)',
  'San Marino (+378)',
  'Sao Tome and Principe (+239)',
  'Saudi Arabia (+966)',
  'Senegal (+221)',
  'Serbia (+381)',
  'Seychelles (+248)',
  'Sierra Leone (+232)',
  'Singapore (+65)',
  'Slovakia (+421)',
  'Slovenia (+386)',
  'Solomon Islands (+677)',
  'Somalia (+252)',
  'South Africa (+27)',
  'South Korea (+82)',
  'South Sudan (+211)',
  'Spain (+34)',
  'Sri Lanka (+94)',
  'Sudan (+249)',
  'Suriname (+597)',
  'Sweden (+46)',
  'Switzerland (+41)',
  'Syria (+963)',
  'Taiwan (+886)',
  'Tajikistan (+992)',
  'Tanzania (+255)',
  'Thailand (+66)',
  'Timor-Leste (+670)',
  'Togo (+228)',
  'Tonga (+676)',
  'Trinidad and Tobago (+1)',
  'Tunisia (+216)',
  'Turkey (+90)',
  'Turkmenistan (+993)',
  'Tuvalu (+688)',
  'Uganda (+256)',
  'Ukraine (+380)',
  'United Arab Emirates (+971)',
  'United Kingdom (+44)',
  'United States (+1)',
  'Uruguay (+598)',
  'Uzbekistan (+998)',
  'Vanuatu (+678)',
  'Vatican City (+379)',
  'Venezuela (+58)',
  'Vietnam (+84)',
  'Yemen (+967)',
  'Zambia (+260)',
  'Zimbabwe (+263)',
];

const COUNTRY_ISO_CODES = [
  'AF',
  'AL',
  'DZ',
  'AD',
  'AO',
  'AG',
  'AR',
  'AM',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BT',
  'BO',
  'BA',
  'BW',
  'BR',
  'BN',
  'BG',
  'BF',
  'BI',
  'KH',
  'CM',
  'CA',
  'CV',
  'CF',
  'TD',
  'CL',
  'CN',
  'CO',
  'KM',
  'CG',
  'CR',
  'HR',
  'CU',
  'CY',
  'CZ',
  'CD',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'SZ',
  'ET',
  'FJ',
  'FI',
  'FR',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GR',
  'GD',
  'GT',
  'GN',
  'GW',
  'GY',
  'HT',
  'HN',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IL',
  'IT',
  'JM',
  'JP',
  'JO',
  'KZ',
  'KE',
  'KI',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MR',
  'MU',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'NZ',
  'NI',
  'NE',
  'NG',
  'KP',
  'MK',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PL',
  'PT',
  'QA',
  'RO',
  'RU',
  'RW',
  'KN',
  'LC',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'KR',
  'SS',
  'ES',
  'LK',
  'SD',
  'SR',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TV',
  'UG',
  'UA',
  'AE',
  'GB',
  'US',
  'UY',
  'UZ',
  'VU',
  'VA',
  'VE',
  'VN',
  'YE',
  'ZM',
  'ZW',
];

const getDialCode = (countryOption: string) =>
  countryOption.match(/\((\+\d+)\)/)?.[1] ?? countryOption;

const getCountryName = (countryOption: string) =>
  countryOption.replace(/\s\(\+\d+\)$/, '');

const flagFromIsoCode = (isoCode: string) =>
  isoCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );

const COUNTRY_OPTIONS = COUNTRY_CODE_OPTIONS.map((option, index) => {
  const isoCode = COUNTRY_ISO_CODES[index] ?? '';
  return {
    label: option,
    name: getCountryName(option),
    dialCode: getDialCode(option),
    flag: isoCode ? flagFromIsoCode(isoCode) : '',
  };
});

const getCountryByDialCode = (dialCode: string) =>
  COUNTRY_OPTIONS.find(option => option.dialCode === dialCode) ??
  COUNTRY_OPTIONS.find(option => option.dialCode === '+91') ??
  COUNTRY_OPTIONS[0];

interface CountryCodePickerProps {
  value: string;
  onSelect: (dialCode: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  value,
  onSelect,
}) => {
  const [visible, setVisible] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const selectedCountry = getCountryByDialCode(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = React.useMemo(() => {
    if (!normalizedQuery) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      option =>
        option.name.toLowerCase().includes(normalizedQuery) ||
        option.dialCode.includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const handleSelect = (dialCode: string) => {
    onSelect(dialCode);
    setQuery('');
    setVisible(false);
  };

  return (
    <View style={styles.countryCodeField}>
      <Text style={styles.countryPickerLabel}>Country Code</Text>
      <TouchableOpacity
        style={styles.countryPickerTrigger}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.countryPickerFlag}>{selectedCountry.flag}</Text>
        <Text style={styles.countryPickerCode}>{selectedCountry.dialCode}</Text>
        <CaretDownIcon size={16} color={colors.neutrals[40]} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.countryPickerOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.countryPickerModal}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search country"
                  placeholderTextColor={colors.neutrals[40]}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.countrySearchInput}
                />
                <FlatList
                  data={filteredOptions}
                  keyExtractor={item => item.label}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.countryOption}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item.dialCode)}
                    >
                      <Text style={styles.countryOptionFlag}>{item.flag}</Text>
                      <View style={styles.countryOptionTextWrap}>
                        <Text style={styles.countryOptionName}>
                          {item.name}
                        </Text>
                        <Text style={styles.countryOptionCode}>
                          {item.dialCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.countryNoResults}>No countries</Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

interface Step1ProfileProps {
  data: Pick<
    RegistrationData,
    'role' | 'name' | 'dob' | 'academyName' | 'countryCode' | 'phoneNumber'
  >;
  onUpdate: (fields: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  stepDisplay?: number;
  isExiting?: boolean;
}

export const Step1Profile: React.FC<Step1ProfileProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  isLoading,
  stepDisplay,
  isExiting,
}) => {
  const isCoach = data.role === 'coach';
  const isValid =
    !!data.name.trim() &&
    !!data.dob &&
    (!isCoach ||
      (!!data.academyName.trim() &&
        !!data.countryCode &&
        !!data.phoneNumber.trim()));

  return (
    <BaseAuthLayout
      title="Personal Profile"
      subtitle="Tell us about yourself"
      onBack={onBack}
      currentStep={stepDisplay ?? 1}
      totalSteps={2}
      isExiting={isExiting}
      hasFooterBackground={true}
      footer={
        <Button
          label="CONTINUE"
          onPress={onNext}
          variant="primary"
          loading={isLoading}
          disabled={isLoading || !isValid}
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Input
            label="Name"
            placeholder="Enter Name"
            value={data.name}
            onChangeText={val => onUpdate({ name: val })}
          />
          {isCoach && (
            <>
              <Input
                label="Academy Name"
                placeholder="Enter Academy Name"
                value={data.academyName}
                onChangeText={val => onUpdate({ academyName: val })}
              />
              <View style={styles.phoneRow}>
                <CountryCodePicker
                  value={data.countryCode}
                  onSelect={val => onUpdate({ countryCode: val })}
                />
                <Input
                  label="Phone Number"
                  placeholder="Phone Number"
                  value={data.phoneNumber}
                  onChangeText={val =>
                    onUpdate({ phoneNumber: val.replace(/\D/g, '') })
                  }
                  keyboardType="phone-pad"
                  containerStyle={styles.phoneNumberField}
                />
              </View>
            </>
          )}
          <DatePicker
            label="Date of Birth"
            value={data.dob}
            onChange={val => onUpdate({ dob: val })}
          />
        </View>
      </ScrollView>
    </BaseAuthLayout>
  );
};
