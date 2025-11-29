// lib/db/adminRoles.ts
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export type AdminRolesDoc = {
  superadmins: string[]; // emails (lowercased)
  admins: string[];      // userIds (Firebase auth uid)
};

// we use a single doc to store all role info
const ADMIN_ROLES_DOC_REF = doc(db, 'meta', 'adminRoles');

export async function loadAdminRoles(): Promise<AdminRolesDoc> {
  const snap = await getDoc(ADMIN_ROLES_DOC_REF);

  if (!snap.exists()) {
    // default empty structure
    return {
      superadmins: [],
      admins: [],
    };
  }

  const data = snap.data() as Partial<AdminRolesDoc>;

  return {
    superadmins: Array.isArray(data.superadmins) ? data.superadmins : [],
    admins: Array.isArray(data.admins) ? data.admins : [],
  };
}

/**
 * Write helper used by the Admin toggle:
 * - if makeAdmin === true  → ensure userId is in admins[]
 * - if makeAdmin === false → remove userId from admins[]
 */
export async function setUserAdminRole(
  userId: string,
  makeAdmin: boolean,
): Promise<void> {
  const snap = await getDoc(ADMIN_ROLES_DOC_REF);

  if (!snap.exists()) {
    const docData: AdminRolesDoc = {
      superadmins: [],
      admins: makeAdmin ? [userId] : [],
    };
    await setDoc(ADMIN_ROLES_DOC_REF, docData);
    return;
  }

  const data = snap.data() as Partial<AdminRolesDoc>;
  const admins = new Set<string>(
    Array.isArray(data.admins) ? data.admins : [],
  );

  if (makeAdmin) {
    admins.add(userId);
  } else {
    admins.delete(userId);
  }

  await updateDoc(ADMIN_ROLES_DOC_REF, {
    admins: Array.from(admins),
  });
}

