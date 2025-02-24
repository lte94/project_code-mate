import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { dbService, authService } from '../shared/firebase';
import Profile from '../components/mypage/Profile';
import MyPost from '../components/mypage/MyPost';
import { updateProfile } from '@firebase/auth';
import MyInfo from '../components/mypage/MyInfo';
import EditInfo from '../components/mypage/EditInfo';
import MypageUrlModal from '../components/modal/MypageUrlmodal';


export default function Mypage() {
  const displayName = authService.currentUser?.displayName;

  const [isEditProfile, setIsEditProfile] = useState(false);
  const [nickName, setnickName] = useState('');
  const [stack, setStack]: any = useState('');
  const [gitAddress, setGitAddress] = useState('');
  const [introduce, setIntroduce] = useState('');
  const [checkViewModal, setCheckViewModal] = useState<any>(false);
  const [checkUrlModal, setCheckUrlModal] = useState<any>(false);

  const [myInfo, setMyInfo] = useState<DocumentData>();
  const uid = authService.currentUser?.uid;
  const userEmail = authService.currentUser?.email;
  const [formData, setFormData] = useState<DocumentData>({
    nickName: displayName,
    stack: stack,
    gitAddress: gitAddress,
    introduce: introduce,
    userid: uid,
  });

  const handleChange = (e: any) => {
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [e.target.name]: e.target.value,
      };
    });
  };

  const onChangeNickName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setnickName(e.target.value);
  };
  const onChangegitAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGitAddress(e.target.value);
  };
  const onChangeintroduce = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntroduce(e.target.value);
  };
  console.log('formData', formData);
  console.log(Boolean(formData?.gitAddress));
  const onSubmitMyInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('formdata', formData);
    let reg_url =
      /^(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))*\/?$/;
    // 문서 id를 uid로 저장해서, 동일한 문서id가 있으면 update 됨.
    if (!(formData?.nickName || displayName)) {
      // formdata가 빈값이면 if문은 true
      setCheckViewModal(true);
      return;
    } else if (formData?.gitAddress) {
      // 닉네임 빈값 아니면 깃어드레스 내용 있는지 체크, 만약 내용이 있으면 true
      if (!reg_url.test(formData?.gitAddress)) {
        // 정규식 체크해서 정규식에 부합하지 않으면 알러트
        setCheckUrlModal(true);
        return;
      } else {
        //정규식에 부합하면 코드 실행
        await updateDoc(doc(dbService, 'user', userEmail), {
          gitAddress: formData?.gitAddress ?? '',
          nickName: formData?.nickName ?? displayName,
          introduce: formData?.introduce ?? '',
          stack: formData?.stack ?? '',
          userid: uid,
        });
        await updateProfile(authService?.currentUser, {
          displayName: formData?.nickName,
        });
        getMyInfo();
        setIsEditProfile(false);
        console.log('setIsEditProfile', isEditProfile);
      }
    } else {
      //깃 어드레스 내용 없으면
      await updateDoc(doc(dbService, 'user', userEmail), {
        gitAddress: formData?.gitAddress ?? '',
        nickName: formData?.nickName ?? displayName,
        introduce: formData?.introduce ?? '인사말을 입력해주세요.',
        stack: formData?.stack ?? '주 스택을 선택 해주세요.',
        userid: uid,
      });
      await updateProfile(authService?.currentUser, {
        displayName: formData?.nickName,
      });
      getMyInfo();
      setIsEditProfile(false);
      console.log('setIsEditProfile', isEditProfile);
    }
  };

  const getMyInfo: any = async () => {
    const snapshot = await getDoc(doc(dbService, 'user', userEmail));
    const data = snapshot.data(); // 가져온 doc의 객체 내용
    setFormData(data);
  };

  useEffect(() => {
    getMyInfo();
  }, []);

  // 저장된 데이터를 불러와서 myInfo에 넣어줌.

  const [profileContents, setProfileContents] = useState<any>([]);

  return (
    <>
      {checkUrlModal ? (
        <MypageUrlModal setCheckUrlModal={setCheckUrlModal} />
      ) : null}

      <Container>
        <MypageBox>
          <Profile />

          <TopProfileNickName></TopProfileNickName>
          {isEditProfile ? (
            <MyInfo
              isEditProfile={isEditProfile}
              onChangeNickName={onChangeNickName}
              myInfo={myInfo}
              setStack={setStack}
              stack={stack}
              onChangegitAddress={onChangegitAddress}
              onChangeintroduce={onChangeintroduce}
              setIsEditProfile={setIsEditProfile}
              onSubmitMyInfo={onSubmitMyInfo}
              formData={formData}
              handleChange={handleChange}
            />
          ) : (
            <EditInfo
              myInfo={myInfo}
              setIsEditProfile={setIsEditProfile}
              stack={stack}
              formData={formData}
            />
          )}

          <BottomContainer>
            <MyPostTitle>My Post</MyPostTitle>
            <MyPost />
          </BottomContainer>
        </MypageBox>
      </Container>
    </>
  );
}

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  height: 100%;
  margin: 0 auto;

  display: flex;

  border-radius: 10px;
  background-color: #fff;
`;

const MypageBox = styled.div`
  max-width: 1100px;
  width: 100%;
  height: 100%;
  margin: 50px auto;
  padding: 20px;
  border-radius: 10px;
  background-color: #f2f2f2;
`;

// ------------ post ---------------

const MyPostTitle = styled.div`
  margin-top: 50px;
  margin-left: 4px;
  font-size: 24px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopProfileNickName = styled.p`
  background-color: pink;
  font-size: 18px;
  font-weight: 500;
`;
