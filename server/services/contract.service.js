const Contract = require('../models/Contract');
const Event = require('../models/Event');

class ContractService {
    async createContract(data, user) {
        if (user.role !== 'Vendor' && user.role !== 'Organizer' && user.role !== 'Admin' && user.role !== 'Super Admin') {
            throw { status: 403, message: 'Not authorized to create contracts' };
        }

        const event = await Event.findById(data.eventId);
        if (!event) {
            throw { status: 404, message: 'Event not found' };
        }

        const contract = new Contract({
            organizationId: user.role === 'Super Admin' ? data.organizationId : user.organizationId,
            vendorId: data.vendorId,
            eventId: data.eventId,
            status: 'sent',
            terms: data.terms,
            amount: data.amount,
            validUntil: data.validUntil
        });

        await contract.save();
        return contract;
    }

    async getContracts(query, user) {
        const filter = {};
        if (user.role !== 'Super Admin') {
            filter.organizationId = user.organizationId;
        }

        if (query.eventId) filter.eventId = query.eventId;
        if (query.vendorId) filter.vendorId = query.vendorId;

        return await Contract.find(filter)
            .populate('vendorId', 'businessName')
            .populate('eventId', 'title');
    }

    async updateContractStatus(id, status, user) {
        const contract = await Contract.findById(id);
        if (!contract) {
            throw { status: 404, message: 'Contract not found' };
        }

        if (user.role !== 'Super Admin' && contract.organizationId.toString() !== user.organizationId.toString()) {
            throw { status: 403, message: 'Access denied' };
        }

        contract.status = status;
        await contract.save();
        return contract;
    }
}

module.exports = new ContractService();
