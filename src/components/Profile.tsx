import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { ChangeEvent, useEffect, useState } from "react";
import { storage, auth } from "../shared/firebase";
import styled from "styled-components";

export default function Profile() {
  const currentUser = useAuth();
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
  );

  function useAuth() {
    const [currentUser, setCurrentUser] = useState<any>();

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
      return unsub;
    }, []);

    return currentUser;
  }

  async function upload(file: any, currentUser: any, setLoading: any) {
    const fileRef = ref(storage, currentUser.uid + ".png");

    setLoading(true);

    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    updateProfile(currentUser, { photoURL });
    setPhotoURL(photoURL);
    setLoading(false);
    alert("Uploaded file!");
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e?.target?.files?.[0]) {
      setPhoto(e?.target?.files?.[0]);
    }
  }

  async function handleClick() {
    upload(photo, currentUser, setLoading);
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  return (
    <div className="fields">
      <ProfileImage src={photoURL} width={150} height={130} />
      <input type="file" onChange={handleChange} />
      <button disabled={loading || !photo} onClick={handleClick}>
        Upload
      </button>
      <button>수정</button>
    </div>
  );
}

const ProfileImage = styled.img`
  border-radius: 100px;
`;
