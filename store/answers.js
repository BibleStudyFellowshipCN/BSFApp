import { debounce } from 'lodash';
import { saveAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { loadAsync } from '../dataStorage/storage';

function saveAnswer(newState) {
  console.log("Saving answers:" + JSON.stringify(newState));
  saveAsync(newState, Models.Answer);
}
const debouncedSaveAnswer = debounce(saveAnswer, wait = 500)

let answerContent = {};

export async function loadAnswer() {
  answerContent = await loadAsync(Models.Answer, null, false);
  if (!answerContent) {
    answerContent = {};
  }
  if (!answerContent.answers) {
    answerContent.answers = {};
  }
  console.log("loadAnswer: " + JSON.stringify(answerContent));
}

export function getAnswer(questionId) {
  const item = answerContent.answers[questionId];
  const value = item && item.answerText ? item.answerText : "";
  console.log(`getAnswer[${questionId}] => ${value}`);
  return value;
}

export function updateAnswer(questionId, answerText) {
  console.log(`updateAnswer[${questionId}] => ${answerText}`);
  answerContent.answers[questionId] = { answerText };
  debouncedSaveAnswer(answerContent);
}
