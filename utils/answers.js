import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import { Models } from '../dataStorage/models';
import { getCurrentUser } from '../utils/user';
import { loadAsync } from '../dataStorage/storage';

function trim(str) {
    if (str === undefined || str === null) {
        return str;
    }

    return str.trim();
}

export async function syncAnswersAsync(updateAnswer, handleTokenExpired, handleError, handleCompleted) {
    if (!handleTokenExpired) {
        handleTokenExpired = () => {
            showMessage({
                message: getI18nText('错误') + result.status,
                duration: 3000,
                description: getI18nText('登录过期，请重新登录'),
                type: "danger",
            });
        }
    }

    if (!handleError) {
        handleError = () => {
            showMessage({
                message: getI18nText('错误') + result.status,
                duration: 3000,
                description: getI18nText('未知错误，请稍后再试'),
                type: "danger",
            });
        }
    }

    if (!handleCompleted) {
        handleCompleted = (useRemote, useLocal, useMerged) => {
            showMessage({
                message: getI18nText('合并成功'),
                duration: 3000,
                description: getI18nText('使用远程答案: ') + useRemote + '\n' +
                    getI18nText('使用本地答案: ') + useLocal + '\n' +
                    getI18nText('使用合并答案: ') + useMerged,
                type: "success"
            });
        }
    }

    const accessToken = getCurrentUser().getAccessToken();
    let body = { accessToken };

    // Download answers
    let result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=downloadAnswers`, '', 'POST', [], body);
    let succeed = await showWebServiceCallErrorsAsync(result);
    if (!succeed || !result.status || result.status !== 200) {
        if (result.status === 401) {
            handleTokenExpired();
        } else {
            handleError(result);
        }
        return;
    }

    // Merge answers
    let downloadAnswers = result.body.answer ? (result.body.answer === '[]' ? {} : JSON.parse(result.body.answer)) : {};
    let localAnswers = {};
    const answerContent = await loadAsync(Models.Answer, null, false);
    if (answerContent && answerContent.answers) {
        for (let i in answerContent.answers) {
            const item = answerContent.answers[i];
            localAnswers[item.questionId] = item.answerText;
        }
    }

    // console.log({ localAnswers, downloadAnswers });
    let useRemote = 0;
    let useMerged = 0;
    let mergedAnswers = JSON.parse(JSON.stringify(localAnswers));
    for (let i in downloadAnswers) {
        const remote = trim(downloadAnswers[i]);
        const local = trim(localAnswers[i]);
        let merged;
        if (local === undefined || local === null) {
            merged = remote;
            useRemote++;
            updateAnswer(i, merged);
            // console.log(`${i}: ${local} | ${remote} => ${merged} - No local, use remote`);
        } else if (local === remote) {
            merged = local;
            // console.log(`${i}: ${local} | ${remote} => ${merged} - Same, use local`);
        } else if (local.indexOf(remote) !== -1) {
            merged = local;
            // console.log(`${i}: ${local} | ${remote} => ${merged} - local contains remote, use local`);
        } else if (remote.indexOf(local) !== -1) {
            merged = remote;
            useRemote++;
            updateAnswer(i, merged);
            // console.log(`${i}: ${local} | ${remote} => ${merged} - remote contains local, use remote`);
        } else {
            merged = local + '\n---\n' + remote;
            useMerged++;
            updateAnswer(i, merged);
            // console.log(`${i}: ${local} | ${remote} => ${merged} - Use both`);
        }
        mergedAnswers[i] = merged;
    }
    // console.log({ mergedAnswers });
    const useLocal = Object.keys(mergedAnswers).length - useRemote - useMerged;

    // Upload answers
    body = { accessToken, answers: mergedAnswers };
    result = await callWebServiceAsync(`${Models.HostHttpsServer}/api.php?c=uploadAnswers`, '', 'POST', [], body);
    succeed = await showWebServiceCallErrorsAsync(result);
    if (succeed) {
        if (result.status === 201) {
            handleCompleted(useRemote, useLocal, useMerged);
            return;
        }

        if (result.status === 401) {
            handleTokenExpired();
        } else {
            handleError(result);
        }
    }
}