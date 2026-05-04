import { useCallback, useMemo, useState } from 'react';
import type { DisplayNameModalMode } from '../components/ui';
import { useAttendanceSession } from '../features/attendance';
import {
  formatDisplayNameForHeader,
  isValidDisplayName,
  useUserProfile,
} from '../features/userProfile';

export function useMainShellProfileHeader() {
  const session = useAttendanceSession();
  const profile = useUserProfile();
  const [editNameOpen, setEditNameOpen] = useState(false);

  const hasSavedName = isValidDisplayName(profile.displayName);
  const showInitialNameModal = profile.hydrated && !hasSavedName;
  const nameModalVisible = showInitialNameModal || editNameOpen;
  const nameModalMode: DisplayNameModalMode = showInitialNameModal
    ? 'initial'
    : 'edit';
  const nameModalSeed = showInitialNameModal ? '' : profile.displayName.trim();

  const localHour = session.now.getHours();
  const displayNameTrimmed = profile.displayName.trim();
  const headerGreeting = useMemo(() => {
    let prefix: string;
    if (localHour >= 5 && localHour < 12) {
      prefix = 'Good morning';
    } else if (localHour >= 12 && localHour < 16) {
      prefix = 'Good afternoon';
    } else {
      prefix = 'Good evening';
    }
    const name = hasSavedName
      ? formatDisplayNameForHeader(displayNameTrimmed)
      : 'there';
    return `${prefix}, ${name}.`;
  }, [localHour, hasSavedName, displayNameTrimmed]);

  const avatarInitial = useMemo(() => {
    if (!hasSavedName || displayNameTrimmed.length === 0) {
      return '?';
    }
    const formatted = formatDisplayNameForHeader(displayNameTrimmed);
    const ch = formatted.charAt(0);
    return ch || '?';
  }, [hasSavedName, displayNameTrimmed]);

  const handleSaveDisplayName = useCallback(
    async (trimmed: string) => {
      await profile.setDisplayName(trimmed);
      setEditNameOpen(false);
    },
    [profile],
  );

  const handleDismissNameModal = useCallback(() => {
    setEditNameOpen(false);
  }, []);

  const onAvatarLongPress = useMemo(
    () => (hasSavedName ? () => setEditNameOpen(true) : undefined),
    [hasSavedName],
  );

  return {
    avatarInitial,
    headerGreeting,
    nameModalMode,
    nameModalSeed,
    nameModalVisible,
    onAvatarLongPress,
    onDismissNameModal: handleDismissNameModal,
    onSaveDisplayName: handleSaveDisplayName,
  };
}
