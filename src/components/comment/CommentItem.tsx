import React, { useEffect, useState } from "react";
import styled from "styled-components";
import basicImg from "../../img/basicImg.png";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  DocumentData,
  Timestamp,
  limit,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { dbService } from "../../shared/firebase";
import { Comment } from "../../shared/type";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/config/configStore";
import { async } from "@firebase/util";
import { useParams } from "react-router-dom";
import CheckModal from "../modal/DeleteModal";
import { useDispatch } from "react-redux";
import DeleteModal from "../modal/DeleteModal";
import EditModal from "../modal/EditModal";

export default function CommentItem({ comment }: { comment: Comment }) {
  const [editText, setEditText] = useState("");
  const [editComments, setEditComments] = useState<Comment>({
    id: comment.id,
    commentText: comment.commentText,
    postId: comment.postId,
    userId: comment.userId,
    nickName: comment.nickName,
    createdAt: comment.createdAt,
    isEdit: comment.isEdit,
  });

  const dispatch = useDispatch();

  // 모달
  const [viewDeleteModal, setDeleteViewModal] = useState(false);
  const [viewEditModal, setEditViewModal] = useState(false);
  const openDeleteModalClick = () => {
    setDeleteViewModal(true);
  };
  const openEditModalClick = () => {
    setEditViewModal(true);
  };

  //isEdit true로 바꾸기
  const onClickIsEditSwitch = (commentid: string) => {
    setEditComments({ ...editComments, isEdit: true });
  };

  const editTextOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  // 수정 중 취소버튼 누르면 isEdit이 false로 변경되서 취소할 수 있는 함수
  const cancleEditButton = (commentid: string) => {
    console.log(commentid);
    setEditComments({ ...editComments, isEdit: false });
  };

  //수정 후 data get하면서 editComments state 내의 commentText를 data에 있는 내용으로 업데이트
  const getComment = async () => {
    const snapshot = await getDoc(doc(dbService, "comment", comment.id));
    const data = snapshot.data();
    if (data.id === editComments.id) {
      setEditComments({
        ...editComments,
        commentText: data.commentText,
      });
    }
  };

  // editComments state가 변경될 때 마다 get해오도록 설정
  useEffect(() => {
    getComment();
    console.log("editComments", editComments);
  }, []);

  return (
    <>
      {viewDeleteModal ? (
        <DeleteModal
          setDeleteViewModal={setDeleteViewModal}
          comment={comment}
        />
      ) : null}
      {viewEditModal ? (
        <EditModal
          setEditViewModal={setEditViewModal}
          comment={comment}
          editText={editText}
          setEditComments={setEditComments}
          editComments={editComments}
          setEditText={setEditText}
        />
      ) : null}
      <CommentContentContainer>
        {/* 댓글쓴이+날짜 */}
        <CommentTopContainer>
          <ProfileContainer>
            <ProfilePhoto />
            <ProfileNickName>{comment.nickName}</ProfileNickName>
            <ButtonContainer>
              {editComments.isEdit ? (
                <>
                  <CommentButton onClick={openEditModalClick}>
                    등록
                  </CommentButton>
                  <CommentButton
                    onClick={() => {
                      cancleEditButton(comment.id);
                    }}>
                    취소
                  </CommentButton>
                </>
              ) : (
                <>
                  <CommentButton
                    onClick={() => {
                      onClickIsEditSwitch(comment.id);
                    }}>
                    수정
                  </CommentButton>
                  <CommentButton onClick={openDeleteModalClick}>
                    삭제
                  </CommentButton>
                </>
              )}
            </ButtonContainer>
          </ProfileContainer>
          <Date>{comment.createdAt}</Date>
          {/* {JSON.stringify(comment.createdAt.slice(1, 11))} */}
        </CommentTopContainer>
        {/* 수정버튼 누르면 인풋 생기게 */}
        {editComments.isEdit ? (
          <CommentEditInput
            defaultValue={comment.commentText}
            onChange={editTextOnChange}
          />
        ) : (
          <ContentText>{comment.commentText}</ContentText>
        )}
      </CommentContentContainer>
    </>
  );
}
const CommentContentContainer = styled.div`
  width: 100%;
  border: 1px solid black;
  border-radius: 10px;
  padding: 20px 20px 45px 20px;
  position: relative;
`;

const CommentTopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ProfileContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ProfilePhoto = styled.div`
  background-image: url(${basicImg});
  background-position: center center;
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
  width: 20px;
  height: 20px;
`;

const ProfileNickName = styled.p`
  font-size: 15px;
  font-weight: 500;
`;

const Date = styled.p`
  color: #aaaaaa;
  font-size: 15px;
`;

const ContentText = styled.p`
  white-space: pre-wrap;
`;

const CommentLeftButton = styled.button`
  position: absolute;
  background-color: #ffffff;
  border: 1px solid #000000;
  width: 50px;
  height: 30px;
  border-radius: 20px;

  cursor: pointer;
  &:hover {
    background-color: #262b7f;
    color: #ffffff;
  }
`;
const CommentRightButton = styled.button`
  position: absolute;
  background-color: #ffffff;
  border: 1px solid #000000;
  width: 50px;
  height: 30px;
  border-radius: 20px;
  /* left:-55px;
  top: -26px; */
  cursor: pointer;
  &:hover {
    background-color: #262b7f;
    color: #ffffff;
  }
`;
const CommentEditInput = styled.textarea`
  width: 500px;
  border-radius: 10px;
  padding: 20px 55px 20px 20px;
  outline-color: #262b7f;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
`;
const CommentButton = styled.span`
  font-size: 12px;
  color: #aaaaaa;
  cursor: pointer;
  &:hover {
    color: #000000;
  }
`;
