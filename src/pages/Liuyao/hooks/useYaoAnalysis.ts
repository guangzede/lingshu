import type { YaoData } from '../types'
import { BRANCH_WUXING, BRANCH_HARMONY, BRANCH_CLASH, GENERATES, OVERCOMES, YAO_LABELS } from '../constants/yaoConstants'

interface YaoRelation {
  yaoBranch: string
  yaoWuxing: string
  relations: string[]
}

export const analyzeYao = (
  yao: YaoData,
  yaoIndex: number,
  allYaos: YaoData[],
  dayStem: string,
  dayBranch: string,
  monthStem: string,
  monthBranch: string
): YaoRelation | null => {
  if (!yao.isMoving || !yao.branch) return null

  const relations: string[] = []
  const yaoBranch = yao.branch
  const yaoWuxing = BRANCH_WUXING[yaoBranch]

  // 与本卦其他爻的关系
  allYaos.forEach((otherYao, otherIdx) => {
    if (otherIdx === yaoIndex || !otherYao.branch) return
    const otherWuxing = BRANCH_WUXING[otherYao.branch]

    if (GENERATES[yaoWuxing] === otherWuxing) {
      relations.push(`生${YAO_LABELS[otherIdx]}${otherYao.branch}${otherWuxing}`)
    } else if (OVERCOMES[yaoWuxing] === otherWuxing) {
      relations.push(`克${YAO_LABELS[otherIdx]}${otherYao.branch}${otherWuxing}`)
    }
  })

  // 与日辰的关系
  if (BRANCH_CLASH[yaoBranch] === dayBranch) {
    relations.push(`与日辰${dayStem}${dayBranch}六冲`)
  } else if (BRANCH_HARMONY[yaoBranch] === dayBranch) {
    relations.push(`与日辰${dayStem}${dayBranch}六合`)
  }

  // 与月令的关系
  if (BRANCH_CLASH[yaoBranch] === monthBranch) {
    relations.push(`与月令${monthStem}${monthBranch}六冲`)
  } else if (BRANCH_HARMONY[yaoBranch] === monthBranch) {
    relations.push(`与月令${monthStem}${monthBranch}六合`)
  }

  return {
    yaoBranch,
    yaoWuxing,
    relations
  }
}
