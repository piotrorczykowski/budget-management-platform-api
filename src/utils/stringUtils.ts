import { camelCase, startCase } from 'lodash'

export default class StringUtils {
    static toPascalCase(str: string) {
        return startCase(camelCase(str)).replace(/ /g, '')
    }
}
