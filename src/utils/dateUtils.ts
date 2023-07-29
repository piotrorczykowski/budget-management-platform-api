import moment from 'moment'

export const getDaysArrayForGivenMonth = (month: Date): Date[] =>
    new Array(moment(month).daysInMonth())
        .fill(null)
        .map((_x, i) => moment(month).startOf('month').add(i, 'days').endOf('day').toDate())
